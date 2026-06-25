import pdfplumber
import docx
import pandas as pd
import io


class ParserService:

    @staticmethod
    def parse(file_bytes, file_type):
        """
        Entry point — detects file type and calls correct parser.
        Returns dict with text and page_count.
        """
        if file_type == 'pdf':
            return ParserService._parse_pdf(file_bytes)
        elif file_type == 'docx':
            return ParserService._parse_docx(file_bytes)
        elif file_type == 'xlsx':
            return ParserService._parse_xlsx(file_bytes)
        else:
            raise ValueError(f'Unsupported file type: {file_type}')

    @staticmethod
    def _parse_pdf(file_bytes):
        """Extract text from PDF page by page."""
        pages = []
        with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
            for i, page in enumerate(pdf.pages):
                text = page.extract_text()
                if text and text.strip():
                    pages.append({
                        'page_number': i + 1,
                        'text': text.strip()
                    })
        return {
            'pages': pages,
            'page_count': len(pages),
            'full_text': '\n\n'.join([p['text'] for p in pages])
        }

    @staticmethod
    def _parse_docx(file_bytes):
        """Extract text from Word document paragraph by paragraph."""
        doc = docx.Document(io.BytesIO(file_bytes))
        full_text = '\n'.join([
            para.text.strip()
            for para in doc.paragraphs
            if para.text.strip()
        ])
        return {
            'pages': [{'page_number': 1, 'text': full_text}],
            'page_count': 1,
            'full_text': full_text
        }

    @staticmethod
    def _parse_xlsx(file_bytes):
        """Extract text from all sheets of Excel file."""
        excel = pd.ExcelFile(io.BytesIO(file_bytes))
        all_text = []

        for sheet_name in excel.sheet_names:
            df = excel.parse(sheet_name)
            df = df.fillna('')
            sheet_text = f"Sheet: {sheet_name}\n"
            sheet_text += df.to_string(index=False)
            all_text.append(sheet_text)

        full_text = '\n\n'.join(all_text)
        return {
            'pages': [{'page_number': 1, 'text': full_text}],
            'page_count': 1,
            'full_text': full_text
        }