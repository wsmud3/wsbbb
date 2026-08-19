#!/usr/bin/env python3
"""
Audit all PFM (perform/绝招) definitions in world/skill/ for missing/broken required fields.
"""

import os
import re
import sys

SKILL_DIR = "/home/mud/mud/world/skill"

# Known base skills (from world/skill/base/*.js)
VALID_BASE_SKILLS = {
    "bite", "blade", "club", "dodge", "force", "niutou",
    "parry", "staff", "sword", "throwing", "unarmed", "whip"
}

# Also collect all skill IDs (both base and derived) for cross-referencing
ALL_SKILL_IDS = set()

def collect_all_skill_ids():
    """Collect all skill IDs from all files."""
    global ALL_SKILL_IDS
    for root, dirs, files in os.walk(SKILL_DIR):
        for fname in files:
            if fname.endswith(".js"):
                fpath = os.path.join(root, fname)
                content = read_file(fpath)
                # Look for this.id = "something"
                m = re.search(r'this\.id\s*=\s*"([^"]+)"', content)
                if m:
                    ALL_SKILL_IDS.add(m.group(1))

def read_file(path):
    """Read a file and return its content."""
    with open(path, "r", encoding="utf-8", errors="replace") as f:
        return f.read()

def find_pfm_blocks(content):
    """
    Find all PFM definition blocks from this.pfm = { ... }
    Returns list of (start_line, end_line, block_text) for each PFM block region.
    """
    blocks = []
    # Pattern: this.pfm = { ... };
    # Find the opening {
    pfm_start = re.search(r'this\.pfm\s*=', content)
    if not pfm_start:
        return blocks

    start_idx = pfm_start.end()

    # Find the opening brace
    brace_start = content.find('{', start_idx)
    if brace_start == -1:
        return blocks

    # Track brace depth to find the closing brace
    depth = 0
    in_string = False
    string_char = None
    i = brace_start
    while i < len(content):
        ch = content[i]

        # Handle string literals
        if not in_string:
            if ch in '"\'':
                in_string = True
                string_char = ch
            elif ch == '{':
                depth += 1
            elif ch == '}':
                depth -= 1
                if depth == 0:
                    # Found the closing brace
                    # Block ends after optional ; and ,
                    end_idx = i + 1
                    block_text = content[brace_start:end_idx]
                    # Calculate line numbers
                    start_line = content[:brace_start].count('\n') + 1
                    end_line = content[:end_idx].count('\n') + 1
                    blocks.append((start_line, end_line, block_text))
                    break
        else:
            if ch == '\\':
                i += 1  # skip escaped char
            elif ch == string_char:
                in_string = False
                string_char = None

        i += 1

    return blocks

def extract_pfm_entries(block_text):
    """
    Extract individual PFM entries from a this.pfm block.
    Each entry is: key: { ... },
    Returns list of (key, entry_text) tuples.
    """
    entries = []

    # Remove the outer { and }
    block_text = block_text.strip()
    if block_text.startswith('{'):
        # Find matching closing brace
        depth = 0
        in_string = False
        string_char = None
        inner_start = None
        for i, ch in enumerate(block_text):
            if not in_string:
                if ch in '"\'':
                    in_string = True
                    string_char = ch
                elif ch == '{':
                    depth += 1
                    if depth == 1:
                        inner_start = i + 1 if inner_start is None else inner_start
                elif ch == '}':
                    depth -= 1
                    if depth == 0:
                        block_text = block_text[inner_start:i]
                        break
            else:
                if ch == '\\':
                    # skip next char in iteration by faking it (we just continue)
                    pass
                elif ch == string_char:
                    in_string = False
                    string_char = None

    # Now parse individual entries: key : { ... },
    # We need to handle nested braces
    i = 0
    while i < len(block_text):
        # Skip whitespace and comments
        ch = block_text[i]
        if ch in ' \t\n\r,':
            i += 1
            continue

        # Skip line comments
        if ch == '/' and i + 1 < len(block_text) and block_text[i+1] == '/':
            end = block_text.find('\n', i)
            if end == -1:
                break
            i = end + 1
            continue

        # Skip block comments
        if ch == '/' and i + 1 < len(block_text) and block_text[i+1] == '*':
            end = block_text.find('*/', i + 2)
            if end == -1:
                break
            i = end + 2
            continue

        # Found a key - it can be a bare word or a quoted string
        key = None
        if ch == '"' or ch == "'":
            # Quoted key
            quote = ch
            j = i + 1
            while j < len(block_text):
                if block_text[j] == '\\':
                    j += 2
                    continue
                if block_text[j] == quote:
                    key = block_text[i+1:j]
                    i = j + 1
                    break
                j += 1
        elif ch.isalpha() or ch == '_':
            # Bare key (identifier)
            j = i
            while j < len(block_text) and (block_text[j].isalnum() or block_text[j] == '_'):
                j += 1
            key = block_text[i:j]
            i = j
        else:
            i += 1
            continue

        if key is None:
            i += 1
            continue

        # Look for :
        while i < len(block_text) and block_text[i] in ' \t\n\r':
            i += 1
        if i < len(block_text) and block_text[i] == ':':
            i += 1
        else:
            continue

        # Skip whitespace after :
        while i < len(block_text) and block_text[i] in ' \t\n\r':
            i += 1

        # Now find the value - look for {
        if i < len(block_text) and block_text[i] == '{':
            # Extract the nested object
            depth = 0
            in_string = False
            string_char = None
            j = i
            while j < len(block_text):
                ch2 = block_text[j]
                if not in_string:
                    if ch2 in '"\'':
                        in_string = True
                        string_char = ch2
                    elif ch2 == '{':
                        depth += 1
                    elif ch2 == '}':
                        depth -= 1
                        if depth == 0:
                            entry_text = block_text[i:j+1]
                            entries.append((key, entry_text))
                            i = j + 1
                            break
                else:
                    if ch2 == '\\':
                        j += 1  # skip next
                    elif ch2 == string_char:
                        in_string = False
                        string_char = None
                j += 1
            else:
                # Ran out of text
                break
        else:
            # Could be a reference like "other_pfm" or another value
            # Just scan to next comma or end
            # This handles "ref" type entries
            j = i
            while j < len(block_text):
                if block_text[j] == ',':
                    entry_text = block_text[i:j]
                    entries.append((key, entry_text))
                    i = j + 1
                    break
                if j + 1 >= len(block_text):
                    entry_text = block_text[i:]
                    entries.append((key, entry_text))
                    i = len(block_text)
                    break
                j += 1
            else:
                break

    return entries

def check_pfm_entry(key, entry_text, file_skill_id):
    """
    Check a single PFM entry for required fields.
    Returns list of issues.
    """
    issues = []

    # Check if it's a simple reference (not an object)
    stripped = entry_text.strip()
    if not stripped.startswith('{'):
        # This is a simple value reference (like "ref": "other_skill")
        issues.append({
            "field": "entry_type",
            "detail": f"PFM entry is not an object: {stripped[:100]}",
            "severity": "info"
        })
        return issues

    # Check if the object is empty {}
    inner = stripped[1:-1].strip()
    if not inner:
        issues.append({
            "field": "empty",
            "detail": "PFM entry is an empty object {}",
            "severity": "critical"
        })
        return issues

    # Extract field keys from the entry
    # We'll do a simpler regex-based extraction of fields
    field_keys = set()
    # Match patterns like: "name": or name: or 'name':
    # This is tricky with nested objects and strings - let's find top-level keys only

    # Strategy: Scan the entry text, track brace depth, and extract field names
    depth = 0
    in_string = False
    string_char = None
    current_word = ""
    possible_field = False
    i = 0

    # Also extract actual values for some fields
    # Collect for specific fields
    field_values = {}

    # Track brace depth for current position
    # We want to find key: value pairs at depth 1 (inside the PFM object)

    # Simpler approach: use regex to find all keys at the first brace level
    # Keys can be: "quoted" or 'quoted' or bareword:
    # They come before a : at depth 1

    lines = entry_text.split('\n')
    # Build a simplified view: for each line, track depth and find key: patterns
    # Actually let me just use the brace-tracking approach on the whole entry

    depth = 0
    in_string = False
    string_char = None
    last_key = None

    for idx, ch in enumerate(stripped):
        if not in_string:
            if ch in '"\'':
                in_string = True
                string_char = ch
                # Start of a potential key if at depth 1
                if depth == 1:
                    # Check if this is a property key (followed by ":")
                    # Look ahead
                    quote_end = stripped.find(string_char, idx + 1)
                    if quote_end != -1:
                        # Check if followed by optional whitespace and :
                        after = stripped[quote_end+1:quote_end+4].strip()
                        if after.startswith(':'):
                            key_name = stripped[idx+1:quote_end]
                            field_keys.add(key_name)
                            last_key = key_name
                            # Skip ahead to after the value to find what follows
            elif ch == '{':
                depth += 1
            elif ch == '}':
                depth -= 1
            elif ch == '/' and idx + 1 < len(stripped) and stripped[idx+1] == '/':
                # Line comment - skip to end of line
                eol = stripped.find('\n', idx)
                if eol == -1:
                    break
                # Skip EOL
            elif ch == '/' and idx + 1 < len(stripped) and stripped[idx+1] == '*':
                # Block comment - skip to */
                comment_end = stripped.find('*/', idx + 2)
                if comment_end == -1:
                    break
        else:
            if ch == '\\':
                # Skip next character
                pass  # handled by loop advancement
            elif ch == string_char:
                in_string = False
                string_char = None

    # Re-extract more carefully using proper parsing
    # Let me use a different technique: extract top-level key-value pairs
    field_keys = set()
    field_values = {}

    # Find all top-level keys in the PFM object
    # The entry starts with { so depth 0 = outside, depth 1 = inside PFM object
    depth = 0
    in_string = False
    string_char = None
    in_comment_line = False
    in_comment_block = False

    # Track the current key being processed
    current_key = None
    # Track position of value start for key
    value_start = -1

    i = 0
    while i < len(stripped):
        ch = stripped[i]

        # Handle comments first
        if not in_string and not in_comment_block:
            if ch == '/' and i + 1 < len(stripped):
                if stripped[i+1] == '/' and depth >= 1:
                    in_comment_line = True
                    i += 2
                    continue
                elif stripped[i+1] == '*':
                    in_comment_block = True
                    i += 2
                    continue

        if in_comment_line:
            if ch == '\n':
                in_comment_line = False
            i += 1
            continue

        if in_comment_block:
            if ch == '*' and i + 1 < len(stripped) and stripped[i+1] == '/':
                in_comment_block = False
                i += 2
                continue
            i += 1
            continue

        # Handle strings
        if not in_string:
            if ch in '"\'':
                in_string = True
                string_char = ch
            elif ch == '{':
                depth += 1
            elif ch == '}':
                depth -= 1
            elif ch == ':' and depth == 1:
                # Collect the key name before the colon
                # Look backwards from i, skipping whitespace
                j = i - 1
                while j >= 0 and stripped[j] in ' \t\n\r':
                    j -= 1
                if j >= 0 and (stripped[j] == '"' or stripped[j] == "'"):
                    # Quoted key
                    quote = stripped[j]
                    k = j - 1
                    while k >= 0 and stripped[k] != quote:
                        k -= 1
                    if k >= 0:
                        current_key = stripped[k+1:j]
                        field_keys.add(current_key)
                elif j >= 0 and (stripped[j].isalnum() or stripped[j] == '_'):
                    # Bare key
                    k = j
                    while k >= 0 and (stripped[k].isalnum() or stripped[k] == '_'):
                        k -= 1
                    current_key = stripped[k+1:j+1]
                    field_keys.add(current_key)
        else:
            if ch == '\\':
                i += 1  # skip escaped char
            elif ch == string_char:
                in_string = False
                string_char = None

        i += 1

    # Now check required fields
    has_name = "name" in field_keys
    has_use = "use" in field_keys
    has_query_desc = "query_desc" in field_keys
    has_mp = "mp" in field_keys
    has_query_mp = "query_mp" in field_keys
    has_enable_skill = "enable_skill" in field_keys
    has_distime = "distime" in field_keys
    has_query_distime = "query_distime" in field_keys
    has_releasetime = "releasetime" in field_keys or "release_time" in field_keys
    has_query_releasetime = "query_releasetime" in field_keys
    has_check = "check" in field_keys
    has_ref = "ref" in field_keys

    # name
    if not has_name:
        issues.append({
            "field": "name",
            "detail": "Missing 'name' field (display name)",
            "severity": "critical"
        })

    # use
    if not has_use:
        issues.append({
            "field": "use",
            "detail": "Missing 'use' function (PFM effect implementation)",
            "severity": "critical"
        })

    # query_desc
    if not has_query_desc:
        issues.append({
            "field": "query_desc",
            "detail": "Missing 'query_desc' function (description)",
            "severity": "critical"
        })

    # mp or query_mp
    if not has_mp and not has_query_mp:
        issues.append({
            "field": "mp/query_mp",
            "detail": "Missing both 'mp' (number) and 'query_mp' (function)",
            "severity": "critical"
        })

    # enable_skill
    if not has_enable_skill:
        issues.append({
            "field": "enable_skill",
            "detail": "Missing 'enable_skill' field",
            "severity": "critical"
        })

    # distime or query_distime
    if not has_distime and not has_query_distime:
        issues.append({
            "field": "distime/query_distime",
            "detail": "Missing both 'distime' (number) and 'query_distime' (function)",
            "severity": "critical"
        })

    # releasetime or query_releasetime
    if not has_releasetime and not has_query_releasetime:
        issues.append({
            "field": "releasetime/query_releasetime or release_time/query_releasetime",
            "detail": "Missing both 'releasetime' (or 'release_time') and 'query_releasetime'",
            "severity": "critical"
        })

    # Check for special "ref" key
    if has_ref:
        issues.append({
            "field": "ref",
            "detail": "PFM has 'ref' field (special inheritance reference)",
            "severity": "info"
        })

    return issues

def check_enable_skill(value, fpath):
    """Check if enable_skill value references a valid skill."""
    issues = []
    # Extract the string value of enable_skill
    # Pattern: "enable_skill": "value" or 'enable_skill': 'value'
    m = re.search(r'enable_skill\s*:\s*"([^"]+)"', value)
    if not m:
        m = re.search(r"enable_skill\s*:\s*'([^']+)'", value)
    if m:
        skill_name = m.group(1)
        if skill_name not in VALID_BASE_SKILLS:
            issues.append({
                "field": "enable_skill",
                "detail": f"References unknown base skill '{skill_name}' (not in: {', '.join(sorted(VALID_BASE_SKILLS))})",
                "severity": "major"
            })
        if skill_name not in ALL_SKILL_IDS and skill_name not in VALID_BASE_SKILLS:
            issues.append({
                "field": "enable_skill",
                "detail": f"References non-existent skill ID '{skill_name}'",
                "severity": "major"
            })
    return issues

def main():
    print("=" * 80)
    print("PFM AUDIT REPORT")
    print("=" * 80)
    print()

    collect_all_skill_ids()
    print(f"Found {len(ALL_SKILL_IDS)} unique skill IDs in the system")
    print(f"Valid base skills: {', '.join(sorted(VALID_BASE_SKILLS))}")
    print()

    all_issues = []
    files_with_pfm = []

    # Walk through all files
    for root, dirs, files in os.walk(SKILL_DIR):
        for fname in sorted(files):
            if not fname.endswith(".js"):
                continue

            fpath = os.path.join(root, fname)
            relpath = os.path.relpath(fpath, SKILL_DIR)
            content = read_file(fpath)

            # Check if file has this.pfm
            if 'this.pfm' not in content:
                continue

            # Get the skill ID from the file
            skill_id_m = re.search(r'this\.id\s*=\s*"([^"]+)"', content)
            file_skill_id = skill_id_m.group(1) if skill_id_m else "unknown"

            files_with_pfm.append(relpath)

            # Find PFM blocks
            pfm_blocks = find_pfm_blocks(content)
            if not pfm_blocks:
                all_issues.append({
                    "file": relpath,
                    "skill_id": file_skill_id,
                    "pfm_key": "N/A",
                    "pfm_name": "N/A",
                    "issues": [{
                        "field": "pfm_block",
                        "detail": "Found 'this.pfm' reference but couldn't parse the block",
                        "severity": "major"
                    }]
                })
                continue

            # For each PFM block
            for block_start, block_end, block_text in pfm_blocks:
                # Extract individual PFM entries
                entries = extract_pfm_entries(block_text)

                if not entries:
                    all_issues.append({
                        "file": relpath,
                        "skill_id": file_skill_id,
                        "pfm_key": "N/A",
                        "pfm_name": "N/A",
                        "issues": [{
                            "field": "pfm_entries",
                            "detail": "Found PFM block but couldn't extract any entries",
                            "severity": "major"
                        }]
                    })
                    continue

                for pfm_key, entry_text in entries:
                    pfm_issues = []

                    # Check the entry
                    entry_issues = check_pfm_entry(pfm_key, entry_text, file_skill_id)
                    pfm_issues.extend(entry_issues)

                    # Check enable_skill specifically
                    enable_issues = check_enable_skill(entry_text, fpath)
                    pfm_issues.extend(enable_issues)

                    # Extract name for reporting
                    name_m = re.search(r'name\s*:\s*"([^"]+)"', entry_text)
                    pfm_name = name_m.group(1) if name_m else "(unknown)"

                    if pfm_issues:
                        all_issues.append({
                            "file": relpath,
                            "skill_id": file_skill_id,
                            "pfm_key": pfm_key,
                            "pfm_name": pfm_name,
                            "issues": pfm_issues
                        })

    # Summary
    print(f"Total files with PFM definitions: {len(files_with_pfm)}")
    print(f"Files with issues: {len(set(i['file'] for i in all_issues))} / {len(files_with_pfm)}")
    print(f"Total issue groups: {len(all_issues)}")
    print()

    # Group issues by severity
    critical_issues = [i for i in all_issues if any(iss['severity'] == 'critical' for iss in i['issues'])]
    major_issues = [i for i in all_issues if any(iss['severity'] == 'major' for iss in i['issues'])]

    print(f"Critical issues (won't work): {len(critical_issues)}")
    print(f"Major issues (may partially work): {len(major_issues)}")
    print(f"Info items: {len(all_issues) - len(critical_issues) - len(major_issues)}")
    print()

    # Print detailed findings
    if all_issues:
        print("=" * 80)
        print("DETAILED FINDINGS")
        print("=" * 80)

        # Sort: critical first, then major, then info
        severity_order = {"critical": 0, "major": 1, "info": 2}

        for item in all_issues:
            # Determine worst severity for this item
            worst = min(severity_order.get(iss['severity'], 99) for iss in item['issues'])
            worst_label = {0: "CRITICAL", 1: "MAJOR", 2: "INFO"}.get(worst, "UNKNOWN")

            print()
            print(f"[{worst_label}] File: {item['file']}")
            print(f"   Skill: {item['skill_id']}  |  PFM key: {item['pfm_key']}  |  PFM name: {item['pfm_name']}")
            for iss in item['issues']:
                print(f"   - [{iss['severity'].upper()}] {iss['detail']}")

    print()
    print("=" * 80)
    print("FILES WITH NO ISSUES (checked all PFMs)")
    print("=" * 80)

    # List files with no issues
    files_with_issues = set(i['file'] for i in all_issues)
    clean_files = [f for f in files_with_pfm if f not in files_with_issues]
    for f in clean_files:
        print(f"  OK: {f}")

if __name__ == "__main__":
    main()
