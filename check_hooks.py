import os
import re

hooks = ['useState', 'useEffect', 'useContext', 'useRef', 'useMemo', 'useCallback']

for root, _, files in os.walk('frontend/src'):
    for file in files:
        if file.endswith('.tsx') or file.endswith('.ts'):
            filepath = os.path.join(root, file)
            with open(filepath, 'r') as f:
                content = f.read()
            
            for hook in hooks:
                if hook in content:
                    # Check if it's imported
                    if not re.search(r'import.*' + hook, content):
                        print(f"Missing import for {hook} in {filepath}")
