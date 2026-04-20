from markdown2docx import Markdown2docx

project = Markdown2docx('detailed_architecture.md', 'Architecture_Document.docx')
project.eat_soup()
project.save()
