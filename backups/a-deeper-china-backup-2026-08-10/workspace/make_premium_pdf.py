from __future__ import annotations

import math
from pathlib import Path

from pypdf import PdfReader, PdfWriter
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas


ROOT = Path("/Users/apple/Documents/旅游视频")
SOURCE = ROOT / ".qa/formal_plan_v4/中国入境深度旅行数据库与付费路书项目正式方案_V1.0.pdf"
TMP_DIR = ROOT / "tmp/pdfs"
OUTPUT_DIR = ROOT / "output/pdf"
COVER = TMP_DIR / "premium_cover.pdf"
OUTPUT = OUTPUT_DIR / "中国入境深度旅行数据库与付费路书项目_高级版_V1.0.pdf"

PAGE_W = 612.0
PAGE_H = 792.0

NAVY = "#071A2D"
NAVY_2 = "#0A243C"
CREAM = "#F4F0E8"
GOLD = "#C59A4A"
GOLD_LIGHT = "#DEC48D"
MUTED = "#A9B7C6"
STEEL = "#45627E"


def register_fonts() -> None:
    pdfmetrics.registerFont(
        TTFont("ArialUnicode", "/System/Library/Fonts/Supplemental/Arial Unicode.ttf")
    )


def draw_tracked_text(
    c: canvas.Canvas,
    text: str,
    x: float,
    y: float,
    *,
    font: str,
    size: float,
    color: str,
    tracking: float,
) -> None:
    obj = c.beginText(x, y)
    obj.setFont(font, size)
    obj.setFillColor(color)
    obj.setCharSpace(tracking)
    obj.textLine(text)
    c.drawText(obj)


def draw_route_pattern(c: canvas.Canvas) -> None:
    """Subtle route/database motif: contours, nodes and a structured grid."""
    c.saveState()
    c.setStrokeColor(STEEL)
    c.setLineWidth(0.45)

    for idx in range(8):
        base = 70 + idx * 18
        path = c.beginPath()
        path.moveTo(335, base)
        path.curveTo(
            395,
            base + 34 + 9 * math.sin(idx),
            486,
            base - 24,
            650,
            base + 48,
        )
        c.drawPath(path, stroke=1, fill=0)

    c.setStrokeColor("#153A58")
    c.setLineWidth(0.35)
    for x in (360, 408, 456, 504, 552, 600):
        c.line(x, 72, x, 310)
    for y in (92, 132, 172, 212, 252, 292):
        c.line(340, y, 612, y)

    c.setFillColor(GOLD)
    nodes = [(369, 213), (425, 171), (476, 253), (529, 132), (574, 292)]
    for x, y in nodes:
        c.circle(x, y, 2.3, stroke=0, fill=1)
        c.circle(x, y, 7.5, stroke=1, fill=0)
    c.restoreState()


def make_cover() -> None:
    TMP_DIR.mkdir(parents=True, exist_ok=True)
    c = canvas.Canvas(str(COVER), pagesize=(PAGE_W, PAGE_H))

    c.setFillColor(NAVY)
    c.rect(0, 0, PAGE_W, PAGE_H, stroke=0, fill=1)
    c.setFillColor(NAVY_2)
    c.rect(0, 0, 24, PAGE_H, stroke=0, fill=1)

    # Architectural frame.
    c.setStrokeColor(GOLD)
    c.setLineWidth(0.7)
    c.line(58, 734, 554, 734)
    c.line(58, 58, 554, 58)
    c.line(58, 58, 58, 119)
    c.line(554, 673, 554, 734)

    draw_tracked_text(
        c,
        "FORMAL PROJECT PROPOSAL  ·  V1.0",
        58,
        751,
        font="ArialUnicode",
        size=8.2,
        color=GOLD_LIGHT,
        tracking=1.35,
    )
    draw_tracked_text(
        c,
        "CHINA  /  INBOUND TRAVEL INTELLIGENCE",
        58,
        705,
        font="ArialUnicode",
        size=7.4,
        color=MUTED,
        tracking=1.15,
    )

    # Main Chinese title.
    c.setFillColor(CREAM)
    c.setFont("ArialUnicode", 30)
    c.drawString(58, 598, "中国入境深度旅行数据库")
    c.setFillColor(GOLD_LIGHT)
    c.setFont("ArialUnicode", 22)
    c.drawString(58, 550, "与付费路书项目")

    c.setStrokeColor(GOLD)
    c.setLineWidth(2)
    c.line(58, 516, 138, 516)
    c.setLineWidth(0.55)
    c.line(150, 516, 554, 516)

    c.setFillColor("#C8D3DE")
    c.setFont("ArialUnicode", 12.5)
    c.drawString(58, 473, "以深度数据库、人工校验与在地体验供应链为核心")

    c.setFillColor(MUTED)
    c.setFont("ArialUnicode", 10.2)
    c.drawString(58, 438, "面向海外自由行游客、小型主题团体与文旅合作机构")
    c.drawString(58, 417, "建立少而深、可验证、可持续更新的中国旅行知识产品")

    # Three-part operating thesis.
    c.setFillColor(GOLD)
    c.rect(58, 331, 150, 2, stroke=0, fill=1)
    c.rect(226, 331, 150, 2, stroke=0, fill=1)
    c.rect(394, 331, 160, 2, stroke=0, fill=1)

    for x, number, title, caption in (
        (58, "01", "深度数据库", "事实底座"),
        (226, "02", "人工校验", "信任机制"),
        (394, "03", "在地供应链", "交付能力"),
    ):
        c.setFillColor(GOLD_LIGHT)
        c.setFont("ArialUnicode", 8)
        c.drawString(x, 306, number)
        c.setFillColor(CREAM)
        c.setFont("ArialUnicode", 11.2)
        c.drawString(x + 25, 304, title)
        c.setFillColor(MUTED)
        c.setFont("ArialUnicode", 8.5)
        c.drawString(x + 25, 284, caption)

    draw_route_pattern(c)

    # Bottom publication details.
    draw_tracked_text(
        c,
        "STRATEGY  ·  PRODUCT  ·  OPERATIONS",
        58,
        136,
        font="ArialUnicode",
        size=7.2,
        color=GOLD_LIGHT,
        tracking=1.0,
    )
    c.setFillColor(MUTED)
    c.setFont("ArialUnicode", 8.7)
    c.drawString(58, 104, "2026 年 7 月  |  项目内部决策与合作洽谈版")
    c.setFillColor("#8194A6")
    c.setFont("ArialUnicode", 7.6)
    c.drawRightString(554, 104, "未经许可请勿对外传播")

    c.showPage()
    c.save()


def merge_pdf() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    source = PdfReader(str(SOURCE))
    cover = PdfReader(str(COVER))
    writer = PdfWriter()
    writer.add_page(cover.pages[0])
    for page in source.pages[1:]:
        writer.add_page(page)

    writer.add_metadata(
        {
            "/Title": "中国入境深度旅行数据库与付费路书项目正式方案",
            "/Subject": "深度数据库、人工校验与在地体验供应链项目方案",
            "/Author": "项目工作组",
            "/Keywords": "中国入境旅游, 深度旅行数据库, 付费路书, B2B授权",
            "/Creator": "Codex",
        }
    )

    with OUTPUT.open("wb") as stream:
        writer.write(stream)


if __name__ == "__main__":
    register_fonts()
    make_cover()
    merge_pdf()
    print(OUTPUT)
