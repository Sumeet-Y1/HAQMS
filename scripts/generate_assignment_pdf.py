from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import ListFlowable, ListItem, Paragraph, SimpleDocTemplate, Spacer


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "ASSIGNMENT_DOCUMENTATION.md"
OUTPUT = ROOT / "HAQMS_Assignment_Documentation.pdf"


def build_styles():
    styles = getSampleStyleSheet()
    return {
        "title": ParagraphStyle(
            "CustomTitle",
            parent=styles["Title"],
            fontName="Helvetica-Bold",
            fontSize=22,
            leading=28,
            spaceAfter=18,
            textColor=colors.HexColor("#0f172a"),
            alignment=TA_LEFT,
        ),
        "h2": ParagraphStyle(
            "CustomH2",
            parent=styles["Heading2"],
            fontName="Helvetica-Bold",
            fontSize=15,
            leading=19,
            spaceBefore=10,
            spaceAfter=8,
            textColor=colors.HexColor("#0f172a"),
        ),
        "h3": ParagraphStyle(
            "CustomH3",
            parent=styles["Heading3"],
            fontName="Helvetica-Bold",
            fontSize=12,
            leading=16,
            spaceBefore=8,
            spaceAfter=6,
            textColor=colors.HexColor("#1e293b"),
        ),
        "body": ParagraphStyle(
            "CustomBody",
            parent=styles["BodyText"],
            fontName="Helvetica",
            fontSize=10.5,
            leading=15,
            spaceAfter=7,
            textColor=colors.HexColor("#334155"),
        ),
        "bullet": ParagraphStyle(
            "CustomBullet",
            parent=styles["BodyText"],
            fontName="Helvetica",
            fontSize=10.5,
            leading=14,
            leftIndent=0,
            textColor=colors.HexColor("#334155"),
        ),
    }


def inline_markup(text: str) -> str:
    text = text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
    while "`" in text:
        start = text.find("`")
        end = text.find("`", start + 1)
        if end == -1:
            break
        code = text[start + 1:end]
        text = f"{text[:start]}<font name='Courier'>{code}</font>{text[end + 1:]}"
    return text


def flush_bullets(story, bullet_buffer, bullet_style):
    if not bullet_buffer:
        return
    items = [
        ListItem(Paragraph(inline_markup(item), bullet_style), leftIndent=12)
        for item in bullet_buffer
    ]
    story.append(
        ListFlowable(
            items,
            bulletType="bullet",
            start="circle",
            leftIndent=16,
            bulletFontName="Helvetica",
            bulletFontSize=8,
        )
    )
    story.append(Spacer(1, 6))
    bullet_buffer.clear()


def build_pdf():
    styles = build_styles()
    story = []
    bullet_buffer = []

    lines = SOURCE.read_text(encoding="utf-8").splitlines()

    for raw_line in lines:
        line = raw_line.rstrip()

        if not line.strip():
            flush_bullets(story, bullet_buffer, styles["bullet"])
            story.append(Spacer(1, 4))
            continue

        if line.startswith("# "):
            flush_bullets(story, bullet_buffer, styles["bullet"])
            story.append(Paragraph(inline_markup(line[2:].strip()), styles["title"]))
            continue

        if line.startswith("## "):
            flush_bullets(story, bullet_buffer, styles["bullet"])
            story.append(Paragraph(inline_markup(line[3:].strip()), styles["h2"]))
            continue

        if line.startswith("### "):
            flush_bullets(story, bullet_buffer, styles["bullet"])
            story.append(Paragraph(inline_markup(line[4:].strip()), styles["h3"]))
            continue

        if line.lstrip().startswith("- "):
            bullet_buffer.append(line.lstrip()[2:].strip())
            continue

        if line[0].isdigit() and ". " in line:
            prefix, content = line.split(". ", 1)
            if prefix.isdigit():
                flush_bullets(story, bullet_buffer, styles["bullet"])
                story.append(Paragraph(f"<b>{prefix}.</b> {inline_markup(content.strip())}", styles["body"]))
                continue

        flush_bullets(story, bullet_buffer, styles["bullet"])
        story.append(Paragraph(inline_markup(line.strip()), styles["body"]))

    flush_bullets(story, bullet_buffer, styles["bullet"])

    doc = SimpleDocTemplate(
        str(OUTPUT),
        pagesize=A4,
        rightMargin=0.75 * inch,
        leftMargin=0.75 * inch,
        topMargin=0.75 * inch,
        bottomMargin=0.75 * inch,
        title="HAQMS Internship Assignment Documentation",
        author="OpenAI Codex",
    )
    doc.build(story)
    print(OUTPUT)


if __name__ == "__main__":
    build_pdf()
