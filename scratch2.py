import re

def fine_tune():
    with open('w:/wplab/jobrecommendationportal-gemini/jrpff/src/App.tsx', 'r', encoding='utf-8') as f:
        content = f.read()

    # JobCard hover
    content = content.replace(
        'className="bg-brand-card rounded-2xl border border-brand-border/50 p-6 shadow-lg shadow-black/20 hover:shadow-xl shadow-black/40 transition-all group flex flex-col"',
        'className="bg-brand-card rounded-2xl border border-brand-border/50 p-6 shadow-lg shadow-black/20 hover:shadow-glow hover:-translate-y-1 hover:border-brand-accent/50 transition-all duration-300 group flex flex-col"'
    )
    
    # ResumeScoreCard circle
    content = content.replace('stroke="#f3f4f6"', 'stroke="#334155"')
    
    # Amber hover button in ResumeScoreCard
    content = content.replace(
        'border-amber-200 rounded-2xl hover:border-amber-400 hover:bg-amber-50',
        'border-amber-500/30 rounded-2xl hover:border-amber-500/50 hover:bg-amber-500/10'
    )

    # Indigo hover in ResumeUploadCard
    content = content.replace(
        'border-indigo-200 rounded-2xl p-6 text-center cursor-pointer hover:border-indigo-400 hover:bg-brand-card/50',
        'border-brand-accent/30 rounded-2xl p-6 text-center cursor-pointer hover:border-brand-accent/50 hover:bg-brand-accent/10'
    )
    
    # Navbar border
    content = content.replace(
        'className="bg-brand-card border-b border-brand-border sticky top-0 z-50"',
        'className="bg-brand-bg/80 backdrop-blur-md border-b border-brand-border sticky top-0 z-50"'
    )
    
    # Profile Page inputs
    content = re.sub(
        r'className="w-full p-4 rounded-2xl border border-brand-border focus:ring-2 focus:ring-brand-accent outline-none text-sm"',
        r'className="w-full p-4 rounded-2xl bg-brand-bg border border-brand-border focus:ring-2 focus:ring-brand-accent outline-none text-sm text-brand-text"',
        content
    )
    
    # Login/Register inputs
    content = re.sub(
        r'className="w-full px-4 py-3 rounded-xl border border-brand-border focus:ring-2 focus:ring-brand-accent outline-none text-sm"',
        r'className="w-full px-4 py-3 rounded-xl bg-brand-bg border border-brand-border focus:ring-2 focus:ring-brand-accent outline-none text-sm text-brand-text"',
        content
    )
    content = re.sub(
        r'className="w-full px-4 py-3 rounded-xl border border-brand-border focus:ring-2 focus:ring-brand-accent outline-none"',
        r'className="w-full px-4 py-3 rounded-xl bg-brand-bg border border-brand-border focus:ring-2 focus:ring-brand-accent outline-none text-brand-text"',
        content
    )

    with open('w:/wplab/jobrecommendationportal-gemini/jrpff/src/App.tsx', 'w', encoding='utf-8') as f:
        f.write(content)
        
    print("Fine-tuning complete")

if __name__ == '__main__':
    fine_tune()
