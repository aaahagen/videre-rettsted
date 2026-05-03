import re

def fix_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 1. Change grid to 2 columns if not already
    content = content.replace('<div className="grid grid-cols-1 gap-8 md:grid-cols-3">', '<div className="grid grid-cols-1 gap-8 md:grid-cols-2">')
    
    # 2. Adjust column spans
    content = content.replace('<div className="space-y-6 md:col-span-2">', '<div className="space-y-6 md:col-span-1">')
    content = content.replace('<div className="md:col-span-1 space-y-6">', '<div className="space-y-6 md:col-span-1">')

    # 3. Ensure Collapsibles are present and correctly formatted for Leveringsvindu
    # The previous attempt might have messed up the structure. I'll search for the Leveringsvindu section and wrap it.
    
    # Let's rebuild the columns logic to be cleaner.
    # I will identify the main blocks and re-order them into a 2-column layout.
    
    # Block A: Basic Info
    # Block B: Delivery Details (Time, Description, Notes)
    # Block C: Access & Contact
    # Block D: Hashtags
    # Block E: Delivery Window (Collapsible)
    # Block F: Constraints (Collapsible)
    # Block G: Images
    
    # I'll use a more robust way to reorganize the file.
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

# Actually, it's safer to just rewrite the return part of the component to ensure the 2-column layout and collapsibles.
# Let's read the file again to be sure of the current state.

import sys

with open('src/components/places/place-form.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
skip_until = None

# This is getting complex with string replacement. 
# I will use a direct write_file with the full content I want.
