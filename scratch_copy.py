import re

def update_copy():
    with open('w:/wplab/jobrecommendationportal-gemini/jrpff/src/App.tsx', 'r', encoding='utf-8') as f:
        content = f.read()

    replacements = [
        ('Gemini is reading your resume...', 'AI is reading your resume...'),
        ('>Gemini</span>', '>AI</span>'),
        ('Paste a long job description here and Gemini will extract the key info...', 'Paste a long job description here and AI will extract the key info...'),
        ('Summarize with Gemini', 'Summarize with AI'),
        ('// Lazily fetch Gemini insight for external jobs', '// Lazily fetch AI insight for external jobs'),
        ('Powered by Gemini AI · Indeed · Dice', 'Upload Resume · Extract Skills · Get Matched'),
        ('Gemini AI analyzes your skills and surfaces the best jobs from our portal, Indeed, and Dice — all in one dashboard.', 'Our AI analyzes your resume, scores your profile, and surfaces the best job recommendations — all in one dashboard.'),
        ('© 2026 JobMatch AI · Powered by Gemini AI, Indeed & Dice', '© 2026 JobMatch AI · Powered by AI'),
    ]

    for old, new in replacements:
        content = content.replace(old, new)

    # Feature cards replacement
    old_features = """{[
                    { icon: <Sparkles />, title: "Gemini AI", desc: "Smart skill matching and personalized resume tips powered by Gemini." },
                    { icon: <Globe />, title: "Indeed Jobs", desc: "Live job listings fetched directly from Indeed's database." },
                    { icon: <Zap />, title: "Dice Tech Jobs", desc: "Specialized tech roles from Dice's professional network." },
                    { icon: <CheckCircle />, title: "One Dashboard", desc: "All sources unified with match scores in one place." },
                  ]}"""
    
    new_features = """{[
                    { icon: <Sparkles />, title: "AI Resume Analysis", desc: "Smart skill extraction and personalized resume tips." },
                    { icon: <CheckCircle />, title: "Resume Scoring", desc: "Get an instant AI score and actionable feedback to improve your resume." },
                    { icon: <Zap />, title: "Smart Job Matching", desc: "Intelligent job recommendations based on your exact skill profile." },
                    { icon: <Globe />, title: "Multi-Source Job Discovery", desc: "Explore opportunities aggregated from top job platforms." },
                  ]}"""
                  
    # Handle the fact that spaces might not match exactly, so we'll use a regex if needed, 
    # but the exact block should be present since we didn't touch it much except for class names.
    # Let's find the exact block from the file.

    import ast
    
    with open('w:/wplab/jobrecommendationportal-gemini/jrpff/src/App.tsx', 'w', encoding='utf-8') as f:
        f.write(content)
        
if __name__ == '__main__':
    update_copy()
    print("Done")
