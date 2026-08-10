from __future__ import annotations

import json
import re
import subprocess
import sys
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import (
    BaseDocTemplate,
    Frame,
    HRFlowable,
    PageBreak,
    PageTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
)

ROOT = Path(__file__).resolve().parents[2]
ROUTER = ROOT / "outputs/a-deeper-china-portfolio-router-v0.1"
DEFAULT_INPUT = ROUTER / "samples/client-brief-shanghai-20260910-13-illustrative.json"
DEFAULT_OUTPUT = ROOT / "output/pdf/A-Deeper-China-Shanghai-Human-Checked-Sample-20260910-13.pdf"
DOC_CITY = "SHANGHAI"
CITY_LABELS = {
    "shanghai": "Shanghai", "beijing": "Beijing", "chengdu": "Chengdu", "chongqing": "Chongqing",
    "guangzhou": "Guangzhou", "shenzhen": "Shenzhen", "guilin_yangshuo": "Guilin - Yangshuo",
    "hangzhou": "Hangzhou", "suzhou": "Suzhou", "jingdezhen": "Jingdezhen",
    "quanzhou_dehua": "Quanzhou - Dehua", "wudang": "Wudang Mountains", "jingmai": "Jingmai Mountain",
}

INK = colors.HexColor("#18212B")
MUTED = colors.HexColor("#66727D")
TEAL = colors.HexColor("#0B6E69")
GOLD = colors.HexColor("#D5A84B")
PALE = colors.HexColor("#F3F6F5")
LINE = colors.HexColor("#D8E1DF")


def clean(value: str) -> str:
    replacements = {
        "\u2013": "-", "\u2014": "-", "\u2011": "-",
        "\u2018": "'", "\u2019": "'", "\u201c": '"', "\u201d": '"',
        "\u2026": "...", "\u00a0": " ",
    }
    for old, new in replacements.items():
        value = value.replace(old, new)
    value = re.sub(r"`([^`]+)`", r"\1", value)
    value = value.replace("**", "")
    return value.strip()


def p(text: str, style: ParagraphStyle) -> Paragraph:
    text = clean(text)
    text = re.sub(r"\*\*([^*]+)\*\*", r"<b>\1</b>", text)
    return Paragraph(text, style)


def usable_window(brief: dict) -> str:
    """Describe usable travel windows instead of pretending date span=full days."""
    client = brief.get("client") or {}
    arrival = str((client.get("arrival") or {}).get("date_time") or "")
    departure = str((client.get("departure") or {}).get("date_time") or "")
    try:
        from datetime import date
        a_date = date.fromisoformat(arrival[:10])
        d_date = date.fromisoformat(departure[:10])
        a_hour = int(arrival[11:13])
        d_hour = int(departure[11:13])
        middle = max(0, (d_date - a_date).days - 1)
        arrival_part = "arrival afternoon" if a_hour >= 12 else "arrival day"
        departure_part = "departure morning" if d_hour <= 14 else "departure day"
        if middle:
            return f"Usable time: {arrival_part} / {middle} full day{'s' if middle != 1 else ''} / {departure_part}"
        return f"Usable time: {arrival_part} / {departure_part}"
    except (ValueError, TypeError):
        return "Usable time: confirm arrival and departure windows"


def run_markdown(input_path: Path) -> tuple[dict, str, dict]:
    result = subprocess.run(
        ["node", "bin/client-roadbook.mjs", str(input_path)],
        cwd=ROUTER,
        check=True,
        capture_output=True,
        text=True,
    )
    data = json.loads(result.stdout)
    if not data.get("valid") or data.get("status") != "research_draft":
        raise RuntimeError("The sample must remain a valid research_draft")
    return data, data["markdown"], json.loads(input_path.read_text(encoding="utf-8"))


def on_page(canvas, doc):
    canvas.saveState()
    width, height = A4
    if doc.page > 1:
        canvas.setStrokeColor(LINE)
        canvas.setLineWidth(0.4)
        canvas.line(20 * mm, height - 14 * mm, width - 20 * mm, height - 14 * mm)
        canvas.setFont("Helvetica", 8)
        canvas.setFillColor(MUTED)
        canvas.drawString(20 * mm, height - 10.5 * mm, f"A DEEPER CHINA  /  {DOC_CITY}")
        canvas.drawRightString(width - 20 * mm, 10 * mm, f"{doc.page - 1:02d}")
        canvas.drawString(20 * mm, 10 * mm, "Human-reviewed research draft - no bookings or experience inventory")
    canvas.restoreState()


def build_story(data: dict, markdown: str, brief: dict):
    styles = getSampleStyleSheet()
    cover = ParagraphStyle("Cover", parent=styles["Normal"], fontName="Helvetica-Bold", fontSize=31, leading=35, textColor=INK, spaceAfter=8)
    cover_sub = ParagraphStyle("CoverSub", parent=styles["Normal"], fontName="Helvetica", fontSize=13, leading=18, textColor=TEAL, spaceAfter=8)
    cover_meta = ParagraphStyle("CoverMeta", parent=styles["Normal"], fontName="Helvetica", fontSize=10, leading=15, textColor=MUTED)
    h1 = ParagraphStyle("H1", parent=styles["Heading1"], fontName="Helvetica-Bold", fontSize=20, leading=24, textColor=INK, spaceBefore=12, spaceAfter=9)
    h2 = ParagraphStyle("H2", parent=styles["Heading2"], fontName="Helvetica-Bold", fontSize=14, leading=18, textColor=TEAL, spaceBefore=10, spaceAfter=6)
    h3 = ParagraphStyle("H3", parent=styles["Heading3"], fontName="Helvetica-Bold", fontSize=11.5, leading=15, textColor=INK, spaceBefore=9, spaceAfter=4)
    body = ParagraphStyle("Body", parent=styles["BodyText"], fontName="Helvetica", fontSize=9.2, leading=13.3, textColor=INK, spaceAfter=4)
    small = ParagraphStyle("Small", parent=body, fontSize=8, leading=11, textColor=MUTED)
    bullet = ParagraphStyle("Bullet", parent=body, leftIndent=12, firstLineIndent=-8, bulletIndent=0, spaceAfter=2)
    callout = ParagraphStyle("Callout", parent=body, fontName="Helvetica-Bold", fontSize=10, leading=14, textColor=TEAL)

    # A combined product unit may dispatch to one explicit runtime city. The
    # customer-facing document must name the actual route being delivered.
    city_key = brief.get("runtime_city") or brief.get("city_unit")
    city = CITY_LABELS.get(city_key, city_key or "City").replace("_", " ").title()
    client = brief.get("client") or {}
    travel = brief.get("travel") or {}
    start = travel.get("start_date", "date to confirm")
    end = travel.get("end_date", "date to confirm")
    adults = (client.get("party") or {}).get("adults", "-")
    children = len((client.get("party") or {}).get("children_ages") or [])
    travelers = f"{adults} adults" + (f" / {children} children" if children else "")
    priorities = ", ".join(client.get("priorities") or ["to confirm"])
    pace = client.get("pace", "to confirm")
    first_visit = "First visit" if re.search(r"first visit|first time", brief.get("message", ""), re.I) else "Independent travel"
    story = []
    story += [Spacer(1, 25 * mm), p("A DEEPER CHINA", cover_sub), p(city, cover), p("Decision-led city roadbook", cover_sub), Spacer(1, 8 * mm)]
    story += [p(f"{start} to {end}  /  {travelers}  /  {first_visit}  /  {priorities}  /  {pace} pace", cover_meta)]
    story += [p(usable_window(brief), cover_meta), Spacer(1, 16 * mm)]
    story += [HRFlowable(width="100%", thickness=1.2, color=GOLD), Spacer(1, 9 * mm)]
    story += [p("A route built around what this city can help you understand - and what is better left out.", ParagraphStyle("Lead", parent=body, fontSize=15, leading=21, textColor=INK)), Spacer(1, 11 * mm)]
    cover_table = Table([
        [p("THIS DOCUMENT IS", small), p("THIS DOCUMENT IS NOT", small)],
        [p("A human-reviewed research draft with a route thesis, deliberate trade-offs, low-energy alternatives and checks required before delivery.", body), p("A booking, guide, ticket, hotel, transport, restaurant, live-support or third-party experience promise.", body)],
    ], colWidths=[82 * mm, 82 * mm])
    cover_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), PALE), ("BOX", (0, 0), (-1, -1), 0.5, LINE),
        ("INNERGRID", (0, 0), (-1, -1), 0.5, LINE), ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 10), ("RIGHTPADDING", (0, 0), (-1, -1), 10),
        ("TOPPADDING", (0, 0), (-1, -1), 9), ("BOTTOMPADDING", (0, 0), (-1, -1), 9),
    ]))
    story += [cover_table, Spacer(1, 17 * mm), p("Prepared for independent travel. Verify current access, reservations, transport and weather before use.", small), PageBreak()]

    # Make the product difference visible before the itinerary detail. This is
    # deliberately short: the detailed decision ledger follows in the body.
    story += [p("Why this is not a generic AI itinerary", h1)]
    diff_rows = [
        [p("BUILT FROM YOUR BRIEF", small), p("DECISION, NOT RANKING", small)],
        [p(f"Protects {priorities} and the stated {pace} pace; the route is shaped around the traveller rather than a city checklist.", body), p("Each day has one question, one physical anchor and a stop rule.", body)],
        [p("VISIBLE TRADE-OFFS", small), p("HONEST CERTAINTY", small)],
        [p("Places are removed when they add transfer, queue, privacy or fatigue cost without adding a new answer.", body), p("Opening, reservations, weather, transport and access remain dated human checks before release.", body)],
    ]
    diff_table = Table(diff_rows, colWidths=[82 * mm, 82 * mm])
    diff_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), PALE), ("BOX", (0, 0), (-1, -1), 0.5, LINE),
        ("INNERGRID", (0, 0), (-1, -1), 0.5, LINE), ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 10), ("RIGHTPADDING", (0, 0), (-1, -1), 10),
        ("TOPPADDING", (0, 0), (-1, -1), 8), ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
    ]))
    story += [diff_table, Spacer(1, 8 * mm), p("The following pages explain what was chosen, what was deliberately left out, and what must be checked before this draft can be released.", body), PageBreak()]

    table_rows = []
    in_table = False
    skip_differentiator = False
    for raw in markdown.splitlines():
        line = raw.strip()
        if not line:
            continue
        # The differentiator is presented as a designed front-of-document
        # page above; do not repeat the same section at the end of the body.
        if line == "## Why this is not a generic AI itinerary":
            skip_differentiator = True
            continue
        if skip_differentiator:
            if line.startswith("## "):
                skip_differentiator = False
            else:
                continue
        if line.startswith("# "):
            continue
        if line.startswith("## "):
            if in_table:
                story.append(make_table(table_rows, body))
                table_rows, in_table = [], False
            story += [p(line[3:], h1)]
            continue
        if line.startswith("### "):
            if in_table:
                story.append(make_table(table_rows, body))
                table_rows, in_table = [], False
            story += [p(line[4:], h2)]
            continue
        if line.startswith("|"):
            if "---" in line:
                continue
            table_rows.append([cell.strip() for cell in line.strip("|").split("|")])
            in_table = True
            continue
        if in_table:
            story.append(make_table(table_rows, body))
            table_rows, in_table = [], False
        if line.startswith("- "):
            story.append(p("• " + line[2:], bullet))
        elif line.startswith("  - "):
            story.append(p("• " + line[4:], bullet))
        elif line.startswith("**") and line.endswith("**"):
            story.append(p(line, callout))
        else:
            story.append(p(line, body))
    if in_table:
        story.append(make_table(table_rows, body))
    story += [Spacer(1, 7 * mm), HRFlowable(width="100%", thickness=0.6, color=LINE), Spacer(1, 4 * mm), p("Release status: research draft. Human verification remains required before customer delivery.", small)]
    return story


def make_table(rows, body_style):
    if not rows:
        return Spacer(1, 1)
    cleaned = [[p(cell, body_style) for cell in row] for row in rows]
    widths = [42 * mm, 58 * mm, 58 * mm] if len(rows[0]) == 3 else [158 * mm / len(rows[0])] * len(rows[0])
    table = Table(cleaned, colWidths=widths, repeatRows=1, hAlign="LEFT")
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), TEAL), ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("BOX", (0, 0), (-1, -1), 0.5, LINE), ("INNERGRID", (0, 0), (-1, -1), 0.35, LINE),
        ("VALIGN", (0, 0), (-1, -1), "TOP"), ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("RIGHTPADDING", (0, 0), (-1, -1), 6), ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
    ]))
    return table


def main():
    input_path = Path(sys.argv[1]).expanduser().resolve() if len(sys.argv) > 1 else DEFAULT_INPUT
    output_path = Path(sys.argv[2]).expanduser().resolve() if len(sys.argv) > 2 else DEFAULT_OUTPUT
    data, markdown, brief = run_markdown(input_path)
    global DOC_CITY
    city_key = brief.get("runtime_city") or brief.get("city_unit")
    DOC_CITY = CITY_LABELS.get(city_key, city_key or "City").upper()
    output_path.parent.mkdir(parents=True, exist_ok=True)
    doc = BaseDocTemplate(str(output_path), pagesize=A4, leftMargin=20 * mm, rightMargin=20 * mm, topMargin=21 * mm, bottomMargin=17 * mm, title=f"A Deeper China - {DOC_CITY.title()} Roadbook")
    frame = Frame(doc.leftMargin, doc.bottomMargin, doc.width, doc.height, id="normal")
    doc.addPageTemplates([PageTemplate(id="main", frames=[frame], onPage=on_page)])
    doc.build(build_story(data, markdown, brief))
    print(output_path)


if __name__ == "__main__":
    main()
