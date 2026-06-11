import re

def transform():
    with open('w:/wplab/jobrecommendationportal-gemini/jrpff/src/App.tsx', 'r', encoding='utf-8') as f:
        content = f.read()

    # Mappings
    replacements = {
        r'\bbg-white\b': 'bg-brand-card',
        r'\bbg-gray-50\b': 'bg-brand-bg',
        r'\bbg-gray-100\b': 'bg-brand-bg-sec',
        r'\bbg-indigo-50\b': 'bg-brand-accent/10',
        r'\bbg-indigo-100\b': 'bg-brand-accent/20',
        r'\bbg-indigo-600\b': 'bg-brand-accent',
        r'\bbg-indigo-700\b': 'bg-brand-accent-hover',
        
        r'\btext-gray-900\b': 'text-brand-text',
        r'\btext-gray-700\b': 'text-brand-text-sec',
        r'\btext-gray-600\b': 'text-brand-text-sec',
        r'\btext-gray-500\b': 'text-brand-text-muted',
        r'\btext-gray-400\b': 'text-brand-text-muted',
        r'\btext-indigo-900\b': 'text-brand-text',
        r'\btext-indigo-700\b': 'text-brand-accent',
        r'\btext-indigo-600\b': 'text-brand-accent',
        
        r'\bborder-gray-50\b': 'border-brand-border/30',
        r'\bborder-gray-100\b': 'border-brand-border/50',
        r'\bborder-gray-200\b': 'border-brand-border',
        r'\bborder-indigo-100\b': 'border-brand-accent/20',
        r'\bborder-indigo-200\b': 'border-brand-accent/30',
        
        r'\bhover:bg-gray-50\b': 'hover:bg-brand-bg-sec',
        r'\bhover:bg-gray-100\b': 'hover:bg-brand-border',
        r'\bhover:text-gray-600\b': 'hover:text-brand-text',
        r'\bhover:text-gray-700\b': 'hover:text-brand-text',
        r'\bhover:text-indigo-600\b': 'hover:text-brand-accent',
        r'\bhover:bg-indigo-700\b': 'hover:bg-brand-accent-hover',
        r'\bfocus:ring-indigo-500\b': 'focus:ring-brand-accent',
        
        r'\bshadow-sm\b': 'shadow-lg shadow-black/20',
        r'\bshadow-md\b': 'shadow-xl shadow-black/40',
        r'\bshadow-indigo-100\b': 'shadow-brand-accent/20',
        r'\bshadow-indigo-200\b': 'shadow-brand-accent/30',
    }

    for pattern, repl in replacements.items():
        content = re.sub(pattern, repl, content)

    with open('w:/wplab/jobrecommendationportal-gemini/jrpff/src/App.tsx', 'w', encoding='utf-8') as f:
        f.write(content)
    
    print("Done transforming App.tsx classes")

if __name__ == '__main__':
    transform()
