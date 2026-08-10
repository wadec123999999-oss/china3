from __future__ import annotations

import os
import sys
from pathlib import Path

from docx import Document
from docx.enum.section import WD_SECTION
from docx.enum.style import WD_STYLE_TYPE
from docx.enum.table import WD_CELL_VERTICAL_ALIGNMENT, WD_ROW_HEIGHT_RULE
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_BREAK, WD_LINE_SPACING
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Inches, Pt, RGBColor, Twips


ROOT = Path("/Users/apple/Documents/旅游视频")
OUT_PATH = ROOT / "中国入境深度旅行数据库与付费路书项目正式方案_V1.0.docx"
SKILL_SCRIPTS = Path(
    "/Users/apple/.codex/plugins/cache/openai-primary-runtime/"
    "documents/26.727.11326/skills/documents/scripts"
)
sys.path.insert(0, str(SKILL_SCRIPTS))
from table_geometry import apply_table_geometry, audit_docx_tables  # noqa: E402


# Design preset: narrative_proposal
# Named overrides:
# - CJK font is PingFang SC while Latin text uses Arial.
# - Cover uses restrained navy/gold editorial treatment.
# - Body is left aligned instead of justified to improve mixed Chinese/English rendering.
PAGE_WIDTH_DXA = 9360
TABLE_INDENT_DXA = 120
CELL_MARGINS = {"top": 110, "bottom": 110, "start": 120, "end": 120}

NAVY = "0B2545"
DARK_BLUE = "1F4D78"
BLUE = "2E74B5"
MUTED = "59636E"
LIGHT_GRAY = "F4F6F9"
HEADER_GRAY = "E8EEF5"
MID_GRAY = "D7DEE7"
GOLD = "A77B24"
WHITE = "FFFFFF"
BLACK = "1B1F23"
GREEN = "1F6B4F"
RED = "9B1C1C"

# Arial Unicode MS is used for both Latin and CJK runs because the bundled
# headless renderer on macOS does not reliably honor PingFang's East Asia
# fallback mapping. This keeps the DOCX portable and avoids missing-glyph boxes.
LATIN_FONT = "Arial Unicode MS"
CJK_FONT = "Arial Unicode MS"


def set_run_font(
    run,
    *,
    size: float | None = None,
    bold: bool | None = None,
    italic: bool | None = None,
    color: str | None = None,
    latin_font: str = LATIN_FONT,
    cjk_font: str = CJK_FONT,
):
    run.font.name = latin_font
    rpr = run._element.get_or_add_rPr()
    rfonts = rpr.rFonts
    if rfonts is None:
        rfonts = OxmlElement("w:rFonts")
        rpr.insert(0, rfonts)
    rfonts.set(qn("w:ascii"), latin_font)
    rfonts.set(qn("w:hAnsi"), latin_font)
    rfonts.set(qn("w:eastAsia"), cjk_font)
    rfonts.set(qn("w:cs"), latin_font)
    if size is not None:
        run.font.size = Pt(size)
    if bold is not None:
        run.bold = bold
    if italic is not None:
        run.italic = italic
    if color is not None:
        run.font.color.rgb = RGBColor.from_string(color)


def set_cell_shading(cell, fill: str):
    tc_pr = cell._tc.get_or_add_tcPr()
    shd = tc_pr.find(qn("w:shd"))
    if shd is None:
        shd = OxmlElement("w:shd")
        tc_pr.append(shd)
    shd.set(qn("w:fill"), fill)
    shd.set(qn("w:val"), "clear")


def set_cell_border(cell, color: str = MID_GRAY, size: str = "6"):
    tc_pr = cell._tc.get_or_add_tcPr()
    borders = tc_pr.find(qn("w:tcBorders"))
    if borders is None:
        borders = OxmlElement("w:tcBorders")
        tc_pr.append(borders)
    for edge in ("top", "left", "bottom", "right", "insideH", "insideV"):
        tag = qn(f"w:{edge}")
        element = borders.find(tag)
        if element is None:
            element = OxmlElement(f"w:{edge}")
            borders.append(element)
        element.set(qn("w:val"), "single")
        element.set(qn("w:sz"), size)
        element.set(qn("w:space"), "0")
        element.set(qn("w:color"), color)


def set_repeat_table_header(row):
    tr_pr = row._tr.get_or_add_trPr()
    tbl_header = OxmlElement("w:tblHeader")
    tbl_header.set(qn("w:val"), "true")
    tr_pr.append(tbl_header)


def prevent_row_split(row):
    tr_pr = row._tr.get_or_add_trPr()
    cant_split = OxmlElement("w:cantSplit")
    tr_pr.append(cant_split)


def set_keep_with_next(paragraph, keep=True):
    paragraph.paragraph_format.keep_with_next = keep


def set_paragraph_border_left(paragraph, color=BLUE, size="18", space="10"):
    p_pr = paragraph._p.get_or_add_pPr()
    p_bdr = p_pr.find(qn("w:pBdr"))
    if p_bdr is None:
        p_bdr = OxmlElement("w:pBdr")
        p_pr.append(p_bdr)
    left = p_bdr.find(qn("w:left"))
    if left is None:
        left = OxmlElement("w:left")
        p_bdr.append(left)
    left.set(qn("w:val"), "single")
    left.set(qn("w:sz"), size)
    left.set(qn("w:space"), space)
    left.set(qn("w:color"), color)


def set_paragraph_shading(paragraph, fill=LIGHT_GRAY):
    p_pr = paragraph._p.get_or_add_pPr()
    shd = p_pr.find(qn("w:shd"))
    if shd is None:
        shd = OxmlElement("w:shd")
        p_pr.append(shd)
    shd.set(qn("w:fill"), fill)
    shd.set(qn("w:val"), "clear")


def add_hyperlink(paragraph, text: str, url: str, *, color=BLUE, underline=True):
    part = paragraph.part
    rel_id = part.relate_to(
        url,
        "http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink",
        is_external=True,
    )
    hyperlink = OxmlElement("w:hyperlink")
    hyperlink.set(qn("r:id"), rel_id)
    new_run = OxmlElement("w:r")
    r_pr = OxmlElement("w:rPr")
    r_fonts = OxmlElement("w:rFonts")
    r_fonts.set(qn("w:ascii"), LATIN_FONT)
    r_fonts.set(qn("w:hAnsi"), LATIN_FONT)
    r_fonts.set(qn("w:eastAsia"), CJK_FONT)
    r_pr.append(r_fonts)
    color_el = OxmlElement("w:color")
    color_el.set(qn("w:val"), color)
    r_pr.append(color_el)
    if underline:
        u = OxmlElement("w:u")
        u.set(qn("w:val"), "single")
        r_pr.append(u)
    new_run.append(r_pr)
    text_el = OxmlElement("w:t")
    text_el.text = text
    new_run.append(text_el)
    hyperlink.append(new_run)
    paragraph._p.append(hyperlink)
    return hyperlink


def add_page_field(paragraph):
    run = paragraph.add_run()
    set_run_font(run, size=9, color=MUTED)
    fld_char_begin = OxmlElement("w:fldChar")
    fld_char_begin.set(qn("w:fldCharType"), "begin")
    instr_text = OxmlElement("w:instrText")
    instr_text.set(qn("xml:space"), "preserve")
    instr_text.text = " PAGE "
    fld_char_end = OxmlElement("w:fldChar")
    fld_char_end.set(qn("w:fldCharType"), "end")
    run._r.extend([fld_char_begin, instr_text, fld_char_end])


def add_numbering_definition(doc: Document, *, bullet: bool):
    numbering = doc.part.numbering_part.element
    abstract_ids = [
        int(x.get(qn("w:abstractNumId")))
        for x in numbering.findall(qn("w:abstractNum"))
        if x.get(qn("w:abstractNumId")) is not None
    ]
    num_ids = [
        int(x.get(qn("w:numId")))
        for x in numbering.findall(qn("w:num"))
        if x.get(qn("w:numId")) is not None
    ]
    abstract_id = max(abstract_ids or [0]) + 1
    num_id = max(num_ids or [0]) + 1

    abstract = OxmlElement("w:abstractNum")
    abstract.set(qn("w:abstractNumId"), str(abstract_id))
    multi = OxmlElement("w:multiLevelType")
    multi.set(qn("w:val"), "singleLevel")
    abstract.append(multi)

    level = OxmlElement("w:lvl")
    level.set(qn("w:ilvl"), "0")
    start = OxmlElement("w:start")
    start.set(qn("w:val"), "1")
    level.append(start)
    num_fmt = OxmlElement("w:numFmt")
    num_fmt.set(qn("w:val"), "bullet" if bullet else "decimal")
    level.append(num_fmt)
    lvl_text = OxmlElement("w:lvlText")
    lvl_text.set(qn("w:val"), "•" if bullet else "%1.")
    level.append(lvl_text)
    lvl_jc = OxmlElement("w:lvlJc")
    lvl_jc.set(qn("w:val"), "left")
    level.append(lvl_jc)

    p_pr = OxmlElement("w:pPr")
    tabs = OxmlElement("w:tabs")
    tab = OxmlElement("w:tab")
    tab.set(qn("w:val"), "num")
    tab.set(qn("w:pos"), "540")
    tabs.append(tab)
    p_pr.append(tabs)
    ind = OxmlElement("w:ind")
    ind.set(qn("w:left"), "540")
    ind.set(qn("w:hanging"), "280")
    p_pr.append(ind)
    spacing = OxmlElement("w:spacing")
    spacing.set(qn("w:after"), "80")
    spacing.set(qn("w:line"), "290")
    spacing.set(qn("w:lineRule"), "auto")
    p_pr.append(spacing)
    level.append(p_pr)

    r_pr = OxmlElement("w:rPr")
    r_fonts = OxmlElement("w:rFonts")
    r_fonts.set(qn("w:ascii"), LATIN_FONT)
    r_fonts.set(qn("w:hAnsi"), LATIN_FONT)
    r_fonts.set(qn("w:eastAsia"), CJK_FONT)
    r_pr.append(r_fonts)
    level.append(r_pr)
    abstract.append(level)
    numbering.append(abstract)

    num = OxmlElement("w:num")
    num.set(qn("w:numId"), str(num_id))
    abstract_num_id = OxmlElement("w:abstractNumId")
    abstract_num_id.set(qn("w:val"), str(abstract_id))
    num.append(abstract_num_id)
    numbering.append(num)
    return num_id


def apply_num(paragraph, num_id: int):
    p_pr = paragraph._p.get_or_add_pPr()
    num_pr = p_pr.find(qn("w:numPr"))
    if num_pr is None:
        num_pr = OxmlElement("w:numPr")
        p_pr.append(num_pr)
    ilvl = OxmlElement("w:ilvl")
    ilvl.set(qn("w:val"), "0")
    num_id_el = OxmlElement("w:numId")
    num_id_el.set(qn("w:val"), str(num_id))
    num_pr.append(ilvl)
    num_pr.append(num_id_el)


def configure_styles(doc: Document):
    normal = doc.styles["Normal"]
    normal.font.name = LATIN_FONT
    normal._element.rPr.rFonts.set(qn("w:ascii"), LATIN_FONT)
    normal._element.rPr.rFonts.set(qn("w:hAnsi"), LATIN_FONT)
    normal._element.rPr.rFonts.set(qn("w:eastAsia"), CJK_FONT)
    normal.font.size = Pt(11)
    normal.font.color.rgb = RGBColor.from_string(BLACK)
    normal.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.LEFT
    normal.paragraph_format.space_before = Pt(0)
    normal.paragraph_format.space_after = Pt(8)
    normal.paragraph_format.line_spacing = 1.333

    for name, size, color, before, after in [
        ("Heading 1", 16, BLUE, 18, 10),
        ("Heading 2", 13, BLUE, 12, 6),
        ("Heading 3", 12, DARK_BLUE, 8, 4),
    ]:
        style = doc.styles[name]
        style.font.name = LATIN_FONT
        style._element.rPr.rFonts.set(qn("w:ascii"), LATIN_FONT)
        style._element.rPr.rFonts.set(qn("w:hAnsi"), LATIN_FONT)
        style._element.rPr.rFonts.set(qn("w:eastAsia"), CJK_FONT)
        style.font.size = Pt(size)
        style.font.bold = True
        style.font.color.rgb = RGBColor.from_string(color)
        style.paragraph_format.space_before = Pt(before)
        style.paragraph_format.space_after = Pt(after)
        style.paragraph_format.line_spacing = 1.15
        style.paragraph_format.keep_with_next = True
        style.paragraph_format.keep_together = True

    if "Source Note" not in doc.styles:
        source_style = doc.styles.add_style("Source Note", WD_STYLE_TYPE.PARAGRAPH)
    else:
        source_style = doc.styles["Source Note"]
    source_style.font.name = LATIN_FONT
    source_style._element.rPr.rFonts.set(qn("w:ascii"), LATIN_FONT)
    source_style._element.rPr.rFonts.set(qn("w:hAnsi"), LATIN_FONT)
    source_style._element.rPr.rFonts.set(qn("w:eastAsia"), CJK_FONT)
    source_style.font.size = Pt(8.5)
    source_style.font.color.rgb = RGBColor.from_string(MUTED)
    source_style.paragraph_format.space_before = Pt(4)
    source_style.paragraph_format.space_after = Pt(4)
    source_style.paragraph_format.line_spacing = 1.1


def add_body(doc, text: str, *, bold_prefix: str | None = None, after=8):
    p = doc.add_paragraph(style="Normal")
    p.paragraph_format.space_after = Pt(after)
    if bold_prefix and text.startswith(bold_prefix):
        r1 = p.add_run(bold_prefix)
        set_run_font(r1, size=11, bold=True, color=BLACK)
        r2 = p.add_run(text[len(bold_prefix) :])
        set_run_font(r2, size=11, color=BLACK)
    else:
        run = p.add_run(text)
        set_run_font(run, size=11, color=BLACK)
    return p


def add_bullet(doc, text: str, bullet_num_id: int, *, bold_prefix: str | None = None):
    p = doc.add_paragraph(style="Normal")
    apply_num(p, bullet_num_id)
    p.paragraph_format.space_after = Pt(4)
    p.paragraph_format.line_spacing = 1.208
    if bold_prefix and text.startswith(bold_prefix):
        r1 = p.add_run(bold_prefix)
        set_run_font(r1, size=10.8, bold=True, color=BLACK)
        r2 = p.add_run(text[len(bold_prefix) :])
        set_run_font(r2, size=10.8, color=BLACK)
    else:
        r = p.add_run(text)
        set_run_font(r, size=10.8, color=BLACK)
    return p


def add_numbered(doc, text: str, decimal_num_id: int, *, bold_prefix: str | None = None):
    p = doc.add_paragraph(style="Normal")
    apply_num(p, decimal_num_id)
    p.paragraph_format.space_after = Pt(4)
    p.paragraph_format.line_spacing = 1.208
    if bold_prefix and text.startswith(bold_prefix):
        r1 = p.add_run(bold_prefix)
        set_run_font(r1, size=10.8, bold=True, color=BLACK)
        r2 = p.add_run(text[len(bold_prefix) :])
        set_run_font(r2, size=10.8, color=BLACK)
    else:
        r = p.add_run(text)
        set_run_font(r, size=10.8, color=BLACK)
    return p


def add_heading(doc, level: int, text: str, *, page_break_before=False):
    p = doc.add_paragraph(style=f"Heading {level}")
    p.paragraph_format.page_break_before = page_break_before
    run = p.add_run(text)
    size = {1: 16, 2: 13, 3: 12}[level]
    color = {1: BLUE, 2: BLUE, 3: DARK_BLUE}[level]
    set_run_font(run, size=size, bold=True, color=color)
    return p


def add_callout(doc, label: str, text: str, *, accent=BLUE, fill=LIGHT_GRAY):
    p = doc.add_paragraph()
    p.paragraph_format.left_indent = Inches(0.16)
    p.paragraph_format.right_indent = Inches(0.05)
    p.paragraph_format.space_before = Pt(6)
    p.paragraph_format.space_after = Pt(10)
    p.paragraph_format.line_spacing = 1.2
    set_paragraph_border_left(p, color=accent)
    set_paragraph_shading(p, fill=fill)
    r1 = p.add_run(f"{label}  ")
    set_run_font(r1, size=11, bold=True, color=accent)
    r2 = p.add_run(text)
    set_run_font(r2, size=11, color=BLACK)
    return p


def add_source_note(doc, text: str, links: list[tuple[str, str]] | None = None):
    p = doc.add_paragraph(style="Source Note")
    run = p.add_run(text)
    set_run_font(run, size=8.5, color=MUTED)
    if links:
        for label, url in links:
            p.add_run(" ")
            add_hyperlink(p, label, url, color=BLUE, underline=True)
    return p


def add_table(
    doc,
    headers: list[str],
    rows: list[list[str]],
    widths_dxa: list[int],
    *,
    font_size=9.2,
    header_fill=HEADER_GRAY,
    first_col_bold=False,
    status_color_map: dict[str, str] | None = None,
):
    if sum(widths_dxa) != PAGE_WIDTH_DXA:
        raise ValueError(f"table widths must sum to {PAGE_WIDTH_DXA}: {widths_dxa}")
    table = doc.add_table(rows=1, cols=len(headers))
    table.style = "Table Grid"
    table.alignment = 0
    hdr = table.rows[0]
    set_repeat_table_header(hdr)
    prevent_row_split(hdr)
    for idx, text in enumerate(headers):
        cell = hdr.cells[idx]
        set_cell_shading(cell, header_fill)
        set_cell_border(cell)
        cell.vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.CENTER
        p = cell.paragraphs[0]
        p.paragraph_format.space_before = Pt(0)
        p.paragraph_format.space_after = Pt(0)
        p.paragraph_format.line_spacing = 1.1
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        r = p.add_run(text)
        set_run_font(r, size=font_size, bold=True, color=NAVY)
    for row_values in rows:
        row = table.add_row()
        prevent_row_split(row)
        for idx, text in enumerate(row_values):
            cell = row.cells[idx]
            set_cell_border(cell)
            cell.vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.CENTER
            p = cell.paragraphs[0]
            p.paragraph_format.space_before = Pt(0)
            p.paragraph_format.space_after = Pt(0)
            p.paragraph_format.line_spacing = 1.12
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER if idx == 0 else WD_ALIGN_PARAGRAPH.LEFT
            r = p.add_run(str(text))
            color = BLACK
            if status_color_map:
                for key, mapped_color in status_color_map.items():
                    if key in str(text):
                        color = mapped_color
                        break
            set_run_font(
                r,
                size=font_size,
                bold=(first_col_bold and idx == 0),
                color=color,
            )
    apply_table_geometry(
        table,
        widths_dxa,
        table_width_dxa=PAGE_WIDTH_DXA,
        indent_dxa=TABLE_INDENT_DXA,
        cell_margins_dxa=CELL_MARGINS,
    )
    after = doc.add_paragraph()
    after.paragraph_format.space_before = Pt(0)
    after.paragraph_format.space_after = Pt(4)
    return table


def add_source_item(doc, decimal_num_id: int, title: str, url: str, note: str = ""):
    p = doc.add_paragraph(style="Normal")
    apply_num(p, decimal_num_id)
    p.paragraph_format.space_after = Pt(5)
    p.paragraph_format.line_spacing = 1.15
    r = p.add_run(title)
    set_run_font(r, size=9.2, bold=True, color=BLACK)
    if note:
        r2 = p.add_run(f"：{note} ")
        set_run_font(r2, size=9.2, color=BLACK)
    else:
        p.add_run(" ")
    add_hyperlink(p, "查看来源", url)


def set_document_core_properties(doc: Document):
    props = doc.core_properties
    props.title = "中国入境深度旅行数据库与付费路书项目正式方案"
    props.subject = "城市深度数据库、付费路书、人工校验与在地体验供应链"
    props.author = "项目发起人"
    props.keywords = "入境旅游, 路书, 深度数据库, 上海, 重庆, 泉州, 太极"
    props.comments = "V1.0，合作讨论工作版本"


def build_document():
    doc = Document()
    set_document_core_properties(doc)
    configure_styles(doc)
    bullet_num_id = add_numbering_definition(doc, bullet=True)
    decimal_product_num_id = add_numbering_definition(doc, bullet=False)
    decimal_funnel_num_id = add_numbering_definition(doc, bullet=False)
    decimal_action_num_id = add_numbering_definition(doc, bullet=False)
    decimal_source_num_id = add_numbering_definition(doc, bullet=False)

    section = doc.sections[0]
    section.page_width = Inches(8.5)
    section.page_height = Inches(11)
    section.top_margin = Inches(1)
    section.bottom_margin = Inches(1)
    section.left_margin = Inches(1)
    section.right_margin = Inches(1)
    section.header_distance = Inches(0.492)
    section.footer_distance = Inches(0.492)
    section.different_first_page_header_footer = True

    header = section.header
    hp = header.paragraphs[0]
    hp.alignment = WD_ALIGN_PARAGRAPH.LEFT
    hp.paragraph_format.space_after = Pt(0)
    hr = hp.add_run("中国入境深度旅行数据库与付费路书项目")
    set_run_font(hr, size=8.5, color=MUTED)

    footer = section.footer
    fp = footer.paragraphs[0]
    fp.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    fp.paragraph_format.space_before = Pt(0)
    fp.paragraph_format.space_after = Pt(0)
    fr = fp.add_run("V1.0  |  ")
    set_run_font(fr, size=8.5, color=MUTED)
    add_page_field(fp)

    # Cover page: editorial cover header pattern.
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(78)
    p.paragraph_format.space_after = Pt(18)
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r = p.add_run("正式项目方案")
    set_run_font(r, size=11, bold=True, color=GOLD)

    p = doc.add_paragraph()
    p.paragraph_format.space_after = Pt(12)
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r = p.add_run("中国入境深度旅行数据库\n与付费路书项目")
    set_run_font(r, size=29, bold=True, color=NAVY)

    p = doc.add_paragraph()
    p.paragraph_format.space_after = Pt(34)
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r = p.add_run("以深度数据库、人工校验与在地体验供应链为核心")
    set_run_font(r, size=14, color=DARK_BLUE)

    p = doc.add_paragraph()
    p.paragraph_format.left_indent = Inches(0.7)
    p.paragraph_format.right_indent = Inches(0.7)
    p.paragraph_format.space_after = Pt(76)
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r = p.add_run(
        "面向海外自由行游客、小型主题团体以及酒店、旅行社和目的地合作机构，"
        "构建少而深、可验证、可持续更新的中国旅行知识产品。"
    )
    set_run_font(r, size=11.5, color=MUTED)

    for text, size, bold, color, after in [
        ("版本：V1.0", 10.5, True, NAVY, 4),
        ("日期：2026年7月", 10.5, False, MUTED, 4),
        ("用途：项目内部决策与合作洽谈", 10.5, False, MUTED, 4),
        ("工作版本 · 未经许可请勿对外传播", 9.2, False, GOLD, 0),
    ]:
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p.paragraph_format.space_after = Pt(after)
        r = p.add_run(text)
        set_run_font(r, size=size, bold=bold, color=color)
    doc.add_page_break()

    add_heading(doc, 1, "一、执行摘要")
    add_callout(
        doc,
        "核心决策",
        "不再无边界增加城市数量。以“上海的获客与交付条件、重庆的本地知识、"
        "泉州的一年旅居资源”为首发壁垒，先完成三个可付费样板，再扩展四个区域产品；"
        "新增桂林—阳朔作为华南自然延伸，武当山与景迈茶山保留为后期实验产品。",
        accent=GOLD,
        fill="FBF7EC",
    )
    add_body(
        doc,
        "本项目的商业本质不是再做一个泛化的“AI行程生成器”，而是建立一套由人持续维护、"
        "可追溯、可授权的目的地知识资产。消费者购买的是节省决策时间、降低出错概率和获得"
        "真实在地体验；B2B客户购买的是已经验证过的路线、英文内容和本地供应链。"
    )
    add_table(
        doc,
        ["决策维度", "正式结论"],
        [
            ["项目定位", "深度数据库＋付费路书＋人工校验＋可预约体验＋B2B授权"],
            ["首发样板", "重庆深度路书、泉州—德化文化路书、上海双语太极体验"],
            ["区域骨架", "上海—杭州—苏州；北京—长城；成都—重庆—九寨沟；广州—深圳—桂林—阳朔"],
            ["新增目的地", "仅新增桂林—阳朔，并挂入华南线路，不再新增独立城市库"],
            ["特色产品", "泉州—德化提升为首发特色；景德镇保持第二批高价值主题产品"],
            ["实验产品", "武当山与景迈茶山不删除，但需依赖合作方与人工定制，不先做大规模数据库"],
            ["经营边界", "首期以内容、研究和合作验证为主；涉及组团、代订、收取组合旅游服务费用时，与持证旅行社合作"],
        ],
        [1800, 7560],
        font_size=9.6,
        first_col_bold=True,
    )

    add_heading(doc, 2, "1.1 项目目标")
    for text, prefix in [
        ("建立可持续更新的中国城市深度旅行数据库，而不是一次性攻略文章。", None),
        ("把数据库转化为英文付费路书、个性化规划和可预约文化体验。", None),
        ("利用重庆与泉州的在地知识建立内容权威，利用上海完成海外用户测试与B2B合作。", None),
        ("最终将同一套数据库授权给精品酒店、入境旅行社、文化机构和目的地组织。", None),
    ]:
        add_bullet(doc, text, bullet_num_id, bold_prefix=prefix)

    add_heading(doc, 2, "1.2 成功的前提")
    add_body(
        doc,
        "本项目必须坚持“深度优先于城市数量、真实优先于生成速度、更新能力优先于一次性内容产量”。"
        "如果没有来源、更新时间和人工负责人，一条信息就不能进入可销售版本。"
    )

    add_heading(doc, 1, "二、发起人资源与不可复制优势")
    add_body(
        doc,
        "资源禀赋直接决定首发顺序。现阶段最有价值的不是覆盖全国，而是把已经具备生活经验、"
        "信任关系和实地验证条件的目的地做透。"
    )
    add_table(
        doc,
        ["资源基础", "可形成的产品壁垒", "首期用途"],
        [
            [
                "现居上海",
                "可反复实测交通、场地与服务；便于接触外籍社群、酒店、语言学校和入境旅行社",
                "海外用户访谈、B2B拓展、上海—杭州—苏州线路核验",
            ],
            [
                "重庆人",
                "具备方言、地形、饮食、社区和城市历史的本地理解，能超越“赛博朋克打卡”",
                "制作首个流量型旗舰路书与海外内容样板",
            ],
            [
                "泉州旅居一年且资源丰富",
                "可连接宗教文化、南音梨园戏、闽南建筑、德化陶瓷、安溪茶及真实社区资源",
                "制作高客单文化产品，并建立可预约体验供应链",
            ],
            [
                "上海双语太极老师",
                "中国老师且有美国生活经历，具有跨文化解释与直接英语授课潜力",
                "最快上线的微型体验产品；连接上海体验与武当山进阶旅程",
            ],
        ],
        [1600, 4200, 3560],
        font_size=9.15,
        first_col_bold=True,
    )
    add_callout(
        doc,
        "资源策略",
        "重庆负责获取注意力，泉州负责建立专业权威，上海负责完成交易验证和合作交付。"
        "三者组合比单纯追逐热门城市更有竞争力。",
    )

    add_heading(doc, 2, "2.1 上海太极资源的正式产品定位")
    add_body(
        doc,
        "上海太极不应只写进路书，而应作为可独立购买的体验产品。建议形成“90分钟入门、半日文化体验、"
        "3天小课程”三档结构，并作为武当山进阶产品的前端体验。对外不得在未经核实的情况下使用"
        "“大师”“正宗传人”等称谓。"
    )
    add_table(
        doc,
        ["核验项目", "必须取得的信息", "上线门槛"],
        [
            ["英语教学", "能否全程英语授课；是否教过外国学生；是否需要辅助翻译", "完成一次外籍学员试课"],
            ["资历与授权", "流派、师承、教学年限、可公开履历与英文介绍", "书面确认可宣传内容"],
            ["场地", "固定场地、雨天室内备用场地、交通与洗手间条件", "至少一套全天候方案"],
            ["容量与价格", "单人、小组、包场容量；90分钟、半日、3天报价", "明确结算价和建议零售价"],
            ["影像权", "是否同意拍照、录像及海外平台传播", "签署肖像与内容授权"],
            ["安全规则", "健康提示、受伤处理、保险、取消与退款规则", "形成中英文条款"],
        ],
        [1500, 4600, 3260],
        font_size=9.0,
        first_col_bold=True,
    )

    add_heading(doc, 1, "三、市场机会与用户问题")
    add_body(
        doc,
        "2025年中国外国人来华访问量和入境旅游消费继续恢复，上海、北京、广州、深圳、成都、重庆等"
        "承担主要门户与流量功能。与此同时，海外内容平台上的兴趣越来越由“看景点”转向“如何完成一次"
        "真实且顺畅的旅行”：交通换乘、支付、网络、预约、时间安排、文化解释和避坑成为最常见问题。"
    )
    add_source_note(
        doc,
        "数据提示：2025年全国外国人来华访问约3,517万人次，国际旅游收入约1,311亿美元；各城市统计口径"
        "可能包含入境、过夜、口岸或港澳台数据，不能直接做绝对排名，只用于判断需求规模和增长方向。",
        [
            ("国家统计局", "https://www.stats.gov.cn/english/PressRelease/202602/t20260228_1962661.html"),
            ("上海市政府", "https://www.shanghai.gov.cn/nw4411/20260123/afe8bcc019fb46c38f4bec8781933673.html"),
            ("北京市文旅局", "https://whlyj.beijing.gov.cn/zwgk/zxgs/tjxx/history/2025/rjlyqk/202501/t20250123_4641720.html"),
        ],
    )

    add_heading(doc, 2, "3.1 目标客户")
    for text, prefix in [
        ("首次来华自由行游客：需要可信、低焦虑、可执行的主干路线。", "首次来华自由行游客："),
        ("二次及多次来华游客：需要区别于经典景点的社区、饮食与文化体验。", "二次及多次来华游客："),
        ("主题兴趣游客：陶瓷、茶、太极、道教、传统工艺、科技与城市空间。", "主题兴趣游客："),
        ("小型私人团体：家庭、朋友、艺术院校、文化社群和企业访学。", "小型私人团体："),
        ("B2B客户：精品酒店、青旅、入境旅行社、文化机构和目的地组织。", "B2B客户："),
    ]:
        add_bullet(doc, text, bullet_num_id, bold_prefix=prefix)

    add_heading(doc, 2, "3.2 核心痛点")
    add_table(
        doc,
        ["用户痛点", "现有内容的缺陷", "本项目的解决方式"],
        [
            ["路线过度拥挤", "社交媒体把热门机位堆成清单，忽视跨城和排队时间", "以可行交通时长和每日体力预算反推行程"],
            ["信息不适合外国人", "中文平台信息碎片化，英文攻略更新慢", "中英文双语字段、外国人预约和支付说明"],
            ["平台热度失真", "热门视频强化同质化打卡和不现实预期", "提供“值得去/不值得去/什么人适合”的判断"],
            ["文化解释不足", "只有景点介绍，缺少宗教、城市、工艺和饮食背景", "由在地资源与专家校验核心叙事"],
            ["突发变化", "开放时间、预约规则、天气和节假日随时变化", "版本管理、有效期、替代路线与风险提示"],
        ],
        [1900, 3400, 4060],
        font_size=9.0,
        first_col_bold=True,
    )
    add_source_note(
        doc,
        "平台信号说明：TikTok标签量受地区和时间筛选影响，只作为趋势；YouTube长视频更适合判断叙事吸引力；"
        "Reddit讨论更适合发现真实决策问题。重庆在YouTube/TikTok上的“垂直城市、赛博朋克”叙事很强，"
        "但用户同时需要超越热门机位的在地路线。",
        [
            ("TikTok Creative Center说明", "https://ads.tiktok.com/help/article/how-to-use-trends"),
            ("USC重庆YouTube样本分析", "https://uscpublicdiplomacy.org/blog/city-branding-through-tourist-eyes-how-youtube-shapes-chongqing%E2%80%99s-global-image"),
            ("Reddit重庆讨论", "https://www.reddit.com/r/travelchina/comments/1v54zod/impressive_how_chongqing_marketed_to_a_first_tier/"),
        ],
    )

    add_heading(doc, 1, "四、正式产品组合")
    add_callout(
        doc,
        "组合原则",
        "门户城市负责流量与便利，主题目的地负责差异化与高客单。所有城市不采用同一深度、同一节奏开发。",
    )
    city_rows = [
        [
            "首发核心",
            "上海—杭州（含苏州）",
            "门户/B2B/实测基地",
            "现代都市、江南文化、园林、运河、龙井；上海增加双语太极体验",
            "保留；上海先做微体验，区域大路书随后完成",
        ],
        [
            "首发核心",
            "北京（含长城）",
            "海外首访刚需",
            "皇城、胡同、博物馆、长城分线与预约规则",
            "保留；在三座资源优势城市验证后扩建",
        ],
        [
            "首发核心",
            "成都—重庆（含九寨沟）",
            "社交流量＋停留体验＋自然",
            "重庆城市空间与社区、成都生活方式与熊猫、九寨沟自然延伸",
            "保留；重庆作为首个完整旗舰",
        ],
        [
            "首发核心",
            "广州—深圳＋桂林—阳朔",
            "文化美食＋科技＋山水",
            "广州岭南文化、深圳科技游、桂林—阳朔3—4天自然延伸",
            "新增桂林—阳朔；形成完整华南线",
        ],
        [
            "首发特色",
            "泉州—德化",
            "文化权威与高客单",
            "海丝、多宗教共存、南音梨园戏、闽南建筑、德化陶瓷与在地访问",
            "由第二批提升为首发特色产品",
        ],
        [
            "第二批",
            "景德镇",
            "艺术与工艺主题",
            "陶瓷工作室、艺术家社区、工作坊、驻留与收藏购买",
            "保留；在泉州供应链模型验证后复制",
        ],
        [
            "实验产品",
            "武当山",
            "太极/道教/养生",
            "上海太极入门后的3—7天进阶旅程",
            "不删除；先做人工定制和小团",
        ],
        [
            "实验产品",
            "景迈茶山",
            "茶文化/村寨/慢旅行",
            "茶山、茶农、古茶林、布朗族与傣族文化",
            "不删除；必须依赖当地司机、茶农和住宿方",
        ],
    ]
    add_table(
        doc,
        ["级别", "产品单元", "市场角色", "核心内容", "正式判断"],
        city_rows,
        [1150, 1800, 1700, 2800, 1910],
        font_size=8.35,
        first_col_bold=True,
        status_color_map={"新增": GREEN, "提升": GREEN, "不删除": GOLD},
    )

    add_heading(doc, 2, "4.1 暂不纳入正式城市库")
    add_table(
        doc,
        ["候选", "市场判断", "处理方式"],
        [
            ["黄山", "海外认知成立且增长较快，但与现有自然产品重叠", "仅作为上海—杭州或景德镇后的2—3天可插拔延伸"],
            ["大理—丽江", "海外需求较强，但会带出昆明、香格里拉、虎跳峡等大范围维护", "列入第二阶段观察，不与景迈同时重投入"],
            ["哈尔滨", "冬季流量显著，但开放时间、天气、票价和酒店高度季节化", "未来单独开发冬季限定路书"],
            ["厦门、青岛、海口", "具备旅游需求，但在当前组合中缺少足够独特的付费主题", "不恢复，不占用首期资源"],
        ],
        [1500, 4300, 3560],
        font_size=9.1,
        first_col_bold=True,
    )
    add_source_note(
        doc,
        "新增桂林—阳朔的依据：2025年上半年桂林接待入境过夜游客67.45万人次，同比增长79.7%；"
        "Reddit持续出现住宿基地、游船、换乘和天数安排问题，适合付费路书解决。",
        [
            ("桂林入境游数据", "https://regional.chinadaily.com.cn/guangxi/guilin/2025-08/26/c_1119349.htm"),
            ("桂林—阳朔路线讨论", "https://www.reddit.com/r/travelchina/comments/1jjg95j"),
        ],
    )

    add_heading(doc, 1, "五、产品体系与交付标准")
    add_heading(doc, 2, "5.1 五层产品结构")
    product_layers = [
        (
            "城市深度数据库",
            "作为全部产品的事实底座，记录地点、路线、供应商、预约、支付、风险、来源与更新时间。",
        ),
        (
            "标准付费路书",
            "按3天、5天、7天或主题线输出；包含每日节奏、地图节点、预订窗口、Plan B、文化解释与避坑。",
        ),
        (
            "人工校验与个性化规划",
            "针对家庭、老人、儿童、饮食限制、摄影、艺术、茶、太极等需求，由人工复核并调整。",
        ),
        (
            "可预约体验",
            "太极、陶瓷、茶、音乐、传统戏曲、建筑与社区访问等，形成供应商合同、结算和安全规则。",
        ),
        (
            "B2B授权",
            "向酒店、旅行社和目的地机构提供白标路书、英文内容、员工参考库和定期更新服务。",
        ),
    ]
    for title, desc in product_layers:
        add_numbered(doc, f"{title}：{desc}", decimal_product_num_id, bold_prefix=f"{title}：")

    add_heading(doc, 2, "5.2 路书的最低交付标准")
    for text, prefix in [
        ("可执行：每天按地理顺序安排，明确门到门交通、等待时间与体力强度。", "可执行："),
        ("可验证：关键事实必须有来源、最近核验日期和可信度等级。", "可验证："),
        ("对外国人友好：说明护照预约、外卡支付、英文服务、网络与地图使用。", "对外国人友好："),
        ("有判断：明确哪些热门点可以跳过、哪些体验值得付费、适合什么人。", "有判断："),
        ("有替代方案：为天气、闭馆、节假日、人流和交通中断准备Plan B。", "有替代方案："),
        ("有文化解释：不是百科摘录，而是帮助用户理解场所为什么重要。", "有文化解释："),
        ("有版本管理：所有价格和时间敏感信息标记有效期，过期自动进入复核队列。", "有版本管理："),
    ]:
        add_bullet(doc, text, bullet_num_id, bold_prefix=prefix)

    add_heading(doc, 2, "5.3 三个首发样板")
    add_table(
        doc,
        ["样板产品", "核心承诺", "建议首版"],
        [
            [
                "Beyond Cyberpunk Chongqing",
                "让外国游客真正理解山城空间、码头历史、社区生活和重庆饮食，而不是复制洪崖洞机位",
                "5天英文路书＋3条主题步行线＋夜景/交通/火锅专项指南",
            ],
            [
                "Quanzhou & Dehua Living Heritage",
                "通过真实的宗教、戏曲、建筑和工艺联系人进入仍在生活中的海丝文化",
                "5—7天英文文化路书＋3—5个可预约体验",
            ],
            [
                "Shanghai Bilingual Tai Chi",
                "由具有美国生活经历的中国老师向外国初学者直接英语授课",
                "90分钟入门＋半日文化体验＋3天小课程",
            ],
        ],
        [2300, 4300, 2760],
        font_size=9.0,
        first_col_bold=True,
    )

    add_heading(doc, 1, "六、数据库与智能体方案")
    add_body(
        doc,
        "智能体不是项目的第一资产，数据库才是。智能体只能从经过审核的记录中检索并组合路线；"
        "遇到低可信度、过期信息或高风险需求时，应自动提示人工复核，而不是继续生成看似完整的答案。"
    )
    add_heading(doc, 2, "6.1 数据对象")
    add_table(
        doc,
        ["数据对象", "必须包含的字段", "更新责任"],
        [
            ["目的地", "中英文名称、定位、适合人群、季节、停留天数、进入/离开方式", "城市负责人季度复核"],
            ["地点/POI", "坐标、开放时间、门票、预约、护照规则、建议时长、无障碍、Plan B", "按风险30/90/180天复核"],
            ["路线段", "起终点、交通方式、真实耗时、换乘难度、行李和夜间风险", "实测或双来源验证"],
            ["体验供应商", "联系人、语言、容量、价格、结算、取消、保险、影像授权", "合作前与每季度复核"],
            ["餐饮与住宿", "地址、预订、饮食限制、外卡/现金、噪音和交通条件", "高频项目每60—90天"],
            ["规则与风险", "预约政策、节假日、天气、安全、文化禁忌和紧急联系", "变化即更新"],
            ["来源与版本", "来源URL、截图/证据、采集日期、负责人、可信度、废止记录", "系统强制字段"],
        ],
        [1600, 5400, 2360],
        font_size=8.9,
        first_col_bold=True,
    )

    add_heading(doc, 2, "6.2 可信度和时效机制")
    add_table(
        doc,
        ["等级", "定义", "可否进入付费产品"],
        [
            ["A", "官方来源＋近期实地核验或供应商书面确认", "可以直接使用"],
            ["B", "官方来源或两条可靠独立来源，但尚未实地复核", "可以使用，并标注核验日期"],
            ["C", "单一用户内容、社交媒体或历史信息", "仅作为线索，不得作为关键安排"],
            ["过期", "超过设定有效期或来源已失效", "自动隐藏，等待复核"],
        ],
        [1100, 5400, 2860],
        font_size=9.2,
        first_col_bold=True,
        status_color_map={"A": GREEN, "B": BLUE, "C": GOLD, "过期": RED},
    )

    add_heading(doc, 2, "6.3 智能体的功能边界")
    for text in [
        "根据旅行天数、兴趣、预算、体力、语言和出入口城市，从已验证数据库组合路线。",
        "解释为什么推荐或删除某个地点，并展示关键约束，不只输出结果。",
        "对价格、开放时间、预约和供应商信息显示最后更新时间。",
        "遇到儿童、老人、健康风险、宗教敏感、极端天气或跨区域复杂行程时转人工。",
        "不得自动编造供应商、开放时间、价格、交通班次或所谓“本地秘密体验”。",
    ]:
        add_bullet(doc, text, bullet_num_id)

    add_heading(doc, 1, "七、商业模式与价格验证")
    add_body(
        doc,
        "首期价格只能作为市场验证假设，不作为最终报价。所有线下体验必须先取得供应商结算价、"
        "场地成本、税费、保险、支付手续费和取消损失，再倒推出零售价。"
    )
    add_table(
        doc,
        ["收入层", "产品形式", "验证价格/计费方式", "目标"],
        [
            ["B2C数字产品", "标准英文路书、主题路书、城市工具包", "US$19—49；主题深度版US$59—129", "验证内容付费意愿"],
            ["人工服务", "个性化路线调整、人工复核、行前咨询", "US$149—499，按复杂度报价", "提高客单价与信任"],
            ["线下体验", "太极、陶瓷、茶、戏曲、社区访问", "供应商成本＋交付成本＋合理毛利", "建立真实体验壁垒"],
            ["B2B授权", "酒店/旅行社白标路书、英文内容库、员工参考库", "按城市/线路年费＋定制费", "形成可重复收入"],
            ["联合开发", "与机构共同开发主题线路和海外内容", "项目费＋内容维护费", "获得渠道和品牌背书"],
        ],
        [1400, 2700, 2700, 2560],
        font_size=9.0,
        first_col_bold=True,
    )
    add_callout(
        doc,
        "定价原则",
        "先卖一个清晰结果，再增加服务层。免费内容负责证明专业度，付费路书负责解决复杂决策，"
        "人工服务和线下体验负责高客单，B2B授权负责规模化。",
    )

    add_heading(doc, 2, "7.1 推荐的转化路径")
    for text, prefix in [
        ("免费入口：TikTok短视频、YouTube长视频、Reddit问题研究、英文样章与城市检查清单。", "免费入口："),
        ("低价成交：一条城市路书或主题工具包。", "低价成交："),
        ("升级成交：个性化调整、视频咨询、人工校验。", "升级成交："),
        ("高价成交：线下文化体验、私人小团或机构定制。", "高价成交："),
        ("持续收入：酒店与旅行社的内容授权、更新订阅和联名产品。", "持续收入："),
    ]:
        add_numbered(doc, text, decimal_funnel_num_id, bold_prefix=prefix)

    add_heading(doc, 1, "八、海外流量与落地承接")
    add_heading(doc, 2, "8.1 平台分工")
    add_table(
        doc,
        ["平台", "任务", "推荐内容", "转化动作"],
        [
            ["TikTok / Shorts", "获取注意力", "重庆空间反差、上海太极动作、泉州工艺与宗教共存的视觉钩子", "领取免费样章或城市检查清单"],
            ["YouTube", "建立信任", "完整行程复盘、文化解释、老师/匠人访谈、真实交通测试", "购买路书或预约咨询"],
            ["Reddit", "研究与口碑", "回答真实问题，记录游客的天数、换乘、支付和天气痛点", "不硬广；以有用答案引导品牌搜索"],
            ["英文网站/邮件", "承接成交", "清晰产品页、样章、FAQ、更新时间、退款和安全规则", "购买、预约或提交定制需求"],
            ["B2B线下渠道", "稳定获客", "酒店前台二维码、旅行社白标路书、语言学校和外籍社群合作", "合作试点与年度授权"],
        ],
        [1400, 1500, 4000, 2460],
        font_size=8.8,
        first_col_bold=True,
    )

    add_heading(doc, 2, "8.2 三条内容主线")
    for text, prefix in [
        ("重庆——流量主线：“Beyond Cyberpunk”，用热门视觉吸引，再用本地知识建立差异。", "重庆——流量主线："),
        ("泉州——权威主线：“Living Heritage”，以真实人物和仍在使用的文化空间建立可信度。", "泉州——权威主线："),
        ("上海——转化主线：“Meet China in Shanghai”，用太极等低门槛体验完成首次成交。", "上海——转化主线："),
    ]:
        add_bullet(doc, text, bullet_num_id, bold_prefix=prefix)

    add_heading(doc, 2, "8.3 落地承接所需页面")
    for text in [
        "英文总首页：一句话定位、适合谁、为什么可信、三项首发产品。",
        "城市产品页：承诺、样章、包含/不包含、最后更新时间、退款规则。",
        "体验产品页：老师/匠人介绍、场地、时长、容量、价格、健康与安全提示。",
        "定制需求表：日期、人数、兴趣、预算、体力、饮食、语言、已订交通。",
        "合作方页面：B2B授权内容、试点方式、更新机制和合作联系。",
    ]:
        add_bullet(doc, text, bullet_num_id)

    add_heading(doc, 1, "九、实施路线图与工作量")
    add_heading(doc, 2, "9.1 十二个月路线图")
    add_table(
        doc,
        ["阶段", "时间", "主要任务", "通过标准"],
        [
            ["准备期", "第1—2周", "冻结产品架构；建立数据库字段；访谈太极老师与泉州资源；确认合规合作路径", "三项样板均有负责人、信息清单和交付定义"],
            ["样板期", "第1—3个月", "完成重庆5天路书、泉州—德化5—7天路书、上海太极90分钟体验；招募测试用户", "至少10名目标用户完成测试；关键事实A/B级覆盖率≥90%"],
            ["产品期", "第4—6个月", "完善上海—杭州—苏州；把成都、九寨沟接入重庆；上线英文网站和支付承接", "三项付费产品持续成交；退款与重大错误可控"],
            ["扩展期", "第7—9个月", "开发北京—长城和广州—深圳—桂林—阳朔；复制供应商合同与更新流程", "至少3个B2B试点；数据库更新责任明确"],
            ["授权期", "第10—12个月", "景德镇上线；评估武当山、景迈；推出白标路书和年度更新服务", "获得至少1个付费B2B授权或联合开发项目"],
        ],
        [1200, 1250, 4700, 2210],
        font_size=8.8,
        first_col_bold=True,
    )

    add_heading(doc, 2, "9.2 规划工作量")
    add_table(
        doc,
        ["产品类型", "首版工作量估算", "月度维护", "说明"],
        [
            ["单一微体验", "30—60小时", "3—8小时", "包括供应商核验、条款、试课、英文页面和拍摄"],
            ["主题目的地", "100—180小时", "10—20小时", "如泉州—德化、景德镇、武当山、景迈"],
            ["核心区域产品", "180—300小时", "20—40小时", "含多城市、交通、3/5/7天路书和高风险信息复核"],
            ["首期三项样板的精益版", "约150—220小时", "15—30小时", "先做到可测试、可收费，不追求一次性全覆盖"],
        ],
        [1900, 1900, 1600, 3960],
        font_size=9.0,
        first_col_bold=True,
    )
    add_source_note(
        doc,
        "以上为项目规划估算，用于控制范围和排期，不是外包报价。实际工作量取决于现有资料完整度、"
        "合作方响应速度、英文制作深度和实地核验次数。"
    )

    add_heading(doc, 2, "9.3 首期质量与商业指标")
    add_table(
        doc,
        ["指标类别", "建议门槛", "目的"],
        [
            ["数据质量", "关键记录A/B级覆盖率≥90%；每条关键事实有来源和更新时间", "避免“AI看起来正确”"],
            ["用户验证", "每个样板至少10名目标用户完成阅读或体验测试", "确认产品是否真正解决问题"],
            ["付费验证", "三个月内出现真实非熟人付费；记录来源、转化和退款原因", "验证商业需求而非口头兴趣"],
            ["体验交付", "安全事件为零；取消、迟到、退款和影像授权均可执行", "建立可复制运营"],
            ["B2B验证", "六至九个月内完成至少3个酒店/旅行社试点", "验证授权价值"],
            ["更新能力", "高风险信息按30—90天复核，逾期自动下线", "保证长期可信度"],
        ],
        [1600, 4300, 3460],
        font_size=9.0,
        first_col_bold=True,
    )

    add_heading(doc, 1, "十、经营合规与风险控制")
    add_callout(
        doc,
        "重要边界",
        "当业务涉及招徕、组织、接待游客，代订交通/住宿/游览，或将两项以上旅游服务按总价销售时，"
        "可能进入旅行社及在线旅游经营监管范围。首期不得仅凭“路书”或“文化体验”名称规避实际经营性质。",
        accent=RED,
        fill="FDF1F1",
    )
    add_body(
        doc,
        "文化和旅游部《在线旅游经营服务管理暂行规定》要求，在线旅游经营者经营旅行社业务应依法取得"
        "旅行社业务经营许可；2026年施行的《浙江省旅游条例》也明确，不得以研学、户外运动等名义变相"
        "开展包价旅游业务。上海项目在正式收费、代订和组合销售前，应向属地文旅部门、律师与财税顾问"
        "确认经营边界，或直接与具备国内及入境旅游资质的旅行社合作。"
    )
    add_source_note(
        doc,
        "本节为风险提示，不构成法律意见。",
        [
            ("文旅部在线旅游规定", "https://zwgk.mct.gov.cn/zfxxgkml/zcfg/bmgz/202012/t20201204_905349.html"),
            ("旅行社条例", "https://www.samr.gov.cn/zw/zfxxgk/fdzdgknr/bgt/art/2023/art_ef2a9f2dcb674014bc451f3470a4b5cc.html"),
            ("浙江省旅游条例", "https://ct.zj.gov.cn/art/2026/3/10/art_1229678755_2584626.html"),
        ],
    )
    add_heading(doc, 2, "10.1 首期风险清单")
    add_table(
        doc,
        ["风险", "控制措施", "责任触发点"],
        [
            ["无证经营旅行社业务", "内容业务与组团/代订分开；组合旅游服务由持证旅行社签约和收款", "上线预订或打包报价前"],
            ["供应商与游客安全", "核验主体、场地、保险、急救、健康提示和责任条款", "每项体验上线前"],
            ["教师/匠人宣传失实", "资历、师承、称谓、肖像和内容使用取得书面授权", "拍摄与宣传前"],
            ["信息过期导致损失", "关键数据设有效期；高风险记录到期自动下架", "每次内容发布前"],
            ["隐私与支付", "最小化收集护照和健康信息；使用合规支付和数据存储方案", "收集用户信息前"],
            ["宗教与社区打扰", "由在地联系人决定可访问范围；不将礼拜、祭祀和私人空间商品化", "泉州等文化体验设计时"],
        ],
        [1900, 5100, 2360],
        font_size=8.9,
        first_col_bold=True,
    )

    add_heading(doc, 1, "十一、未来30天行动清单")
    actions = [
        "冻结本方案中的城市层级和首发顺序，30天内不再新增目的地。",
        "建立统一数据库模板，先录入重庆、泉州和上海太极三项样板。",
        "完成太极老师的英语试课、资历核验、场地确认、价格、影像授权和安全条款。",
        "从泉州现有资源中筛选10—15位可长期合作的人或机构，优先核验3—5个可预约体验。",
        "完成《Beyond Cyberpunk Chongqing》5天路书目录和第一天完整样章。",
        "制作一个英文落地页，展示三项首发产品、可信依据、最后更新时间和测试招募。",
        "招募10名在上海的外国人进行访谈或试用；至少3人完成太极体验测试。",
        "咨询上海属地文旅、法律和财税专业人士，确定内容销售、体验撮合与旅行社合作边界。",
        "建立每周复盘表：新增记录、过期记录、用户问题、内容流量、付费与合作进展。",
    ]
    for action in actions:
        add_numbered(doc, action, decimal_action_num_id)
    add_callout(
        doc,
        "30天目标",
        "不是完成全国数据库，而是拿出一个可购买的重庆路书样章、一个可交付的上海太极体验、"
        "一个拥有真实合作资源的泉州产品骨架，并获得第一批目标用户反馈。",
        accent=GREEN,
        fill="EEF7F3",
    )

    add_heading(doc, 1, "十二、最终结论")
    add_body(
        doc,
        "本项目具备可行性，但可行性来自“资源深度＋持续核验＋供应链”，而不是城市数量和AI生成速度。"
        "正式组合保持八个产品单元：四个区域核心、泉州与景德镇两个文化特色、武当山与景迈两个实验产品；"
        "桂林—阳朔作为华南延伸加入，不新增新的独立城市库。"
    )
    add_body(
        doc,
        "最优起点是同时启动三个不同功能的样板：重庆证明流量与内容能力，泉州证明文化深度与资源组织能力，"
        "上海太极证明线下成交与交付能力。只有这三项完成真实付费验证后，才进入北京、完整华东线、"
        "完整华南线和B2B授权扩张。"
    )

    add_heading(doc, 1, "附录A：主要研究依据", page_break_before=True)
    add_source_note(
        doc,
        "资料检索截至2026年7月。平台数据和城市统计口径可能变化；正式销售前仍需逐项复核。"
    )
    sources = [
        (
            "国家统计局：2025年国民经济和社会发展统计公报",
            "https://www.stats.gov.cn/english/PressRelease/202602/t20260228_1962661.html",
            "全国外国人来华访问与国际旅游收入",
        ),
        (
            "上海市人民政府：2025年上海旅游数据",
            "https://www.shanghai.gov.cn/nw4411/20260123/afe8bcc019fb46c38f4bec8781933673.html",
            "上海入境及外国游客规模",
        ),
        (
            "北京市文化和旅游局：2025年入境旅游情况",
            "https://whlyj.beijing.gov.cn/zwgk/zxgs/tjxx/history/2025/rjlyqk/202501/t20250123_4641720.html",
            "北京入境及外国游客规模",
        ),
        (
            "杭州市入境旅游专题资料",
            "https://z.hangzhou.com.cn/2025/rddssychy/content/content_9151398.html",
            "外国游客对深度体验、支付和多语言服务的需求",
        ),
        (
            "重庆市人民政府：入境旅游与国际传播",
            "https://www.cq.gov.cn/ywdt/jrcq/202511/t20251104_15136671.html",
            "重庆入境增长与跨城产品方向",
        ),
        (
            "泉州市文化广电和旅游局：2025年上半年旅游数据",
            "https://cbtb.quanzhou.gov.cn/zwgk/tjsj/202507/t20250731_3196140.htm",
            "泉州入境游客和国际旅游收入增长",
        ),
        (
            "Jingdezhen sees robust growth in inbound tourism",
            "https://www.china.org.cn/china/Off_the_Wire/2025-10/20/content_118132392.shtml",
            "景德镇入境游客与国际陶瓷艺术活动",
        ),
        (
            "湖北省文化和旅游厅：武当山入境游",
            "https://wlt.hubei.gov.cn/bmdt/mtjj/202602/t20260205_5870673.shtml",
            "武当山太极与道教主题的海外兴趣",
        ),
        (
            "景迈山2025年旅游数据",
            "https://www.puerw.cn/content/202602/27/c476730.html",
            "景迈山总体游客增长；尚缺可靠外国游客占比",
        ),
        (
            "Guilin's inbound tourism booms with visa-free policy",
            "https://regional.chinadaily.com.cn/guangxi/guilin/2025-08/26/c_1119349.htm",
            "桂林2025年上半年入境过夜游客及收入",
        ),
        (
            "新华网：2025年大理旅游数据",
            "https://www.yn.xinhuanet.com/20260228/86f5406333164d1c8ad82c60e345ab7a/c.html",
            "大理海外游客规模",
        ),
        (
            "黑龙江省文化和旅游厅：哈尔滨冰雪旅游发展报告",
            "https://wlt.hlj.gov.cn/wlt/c114172/202601/c00_31906154.shtml",
            "哈尔滨入境游客、俄罗斯与东南亚市场增长",
        ),
        (
            "TikTok Creative Center：Trends使用说明",
            "https://ads.tiktok.com/help/article/how-to-use-trends",
            "标签趋势的地区、时间和受众分析方法",
        ),
        (
            "USC Center on Public Diplomacy：YouTube如何塑造重庆国际形象",
            "https://uscpublicdiplomacy.org/blog/city-branding-through-tourist-eyes-how-youtube-shapes-chongqing%E2%80%99s-global-image",
            "21条高互动旅游视频的定性样本",
        ),
        (
            "Reddit：桂林—阳朔行程讨论",
            "https://www.reddit.com/r/travelchina/comments/1jjg95j",
            "外国自由行游客关于住宿、游船、换乘和天数的真实问题",
        ),
        (
            "Reddit：泉州是否值得加入行程",
            "https://www.reddit.com/r/travelchina/comments/1l5brfl/why_quanzhou_should_be_on_your_china_itinerary/",
            "泉州的海外兴趣和非主流目的地定位",
        ),
        (
            "Reddit：景迈山古村落与交通讨论",
            "https://www.reddit.com/r/travelchina/comments/1o1np0a/wengji_village_in_yunnan_jing_mai_mountain/",
            "当地交通、包车和进入成本",
        ),
        (
            "文化和旅游部：在线旅游经营服务管理暂行规定",
            "https://zwgk.mct.gov.cn/zfxxgkml/zcfg/bmgz/202012/t20201204_905349.html",
            "在线旅游与旅行社业务许可要求",
        ),
        (
            "国家市场监督管理总局：旅行社条例",
            "https://www.samr.gov.cn/zw/zfxxgk/fdzdgknr/bgt/art/2023/art_ef2a9f2dcb674014bc451f3470a4b5cc.html",
            "旅行社定义、设立与经营要求",
        ),
    ]
    for title, url, note in sources:
        add_source_item(doc, decimal_source_num_id, title, url, note)

    # Page layout checks.
    for p in doc.paragraphs:
        if p.style.name.startswith("Heading"):
            p.paragraph_format.keep_with_next = True
            p.paragraph_format.widow_control = True
        if p.style.name == "Normal":
            p.paragraph_format.widow_control = True

    doc.save(OUT_PATH)
    issues = audit_docx_tables(OUT_PATH)
    if issues:
        raise RuntimeError(f"table geometry audit failed with {issues} issue(s)")
    print(OUT_PATH)


if __name__ == "__main__":
    build_document()
