# Upstream Maintenance Guide

This repository is a fork of the original developer's project (`jqlts1/omnifocus-mcp-enhanced`). Because you are running a custom modification (the "UUID ID-First Restoration"), you maintain your own isolated copy here.

### How this works
- **`origin`**: This points to your personal GitHub repository (`https://github.com/HoweTimms/omnifocus-mcp-enhanced.git`). When you run `git push`, your code goes here.
- **`upstream`**: This points to the original developer's repository (`https://github.com/jqlts1/omnifocus-mcp-enhanced.git`). When you want to pull down their new features, you pull from here.

---

### How to Merge Original Updates into Your Code
If `jqlts1` releases a new feature or bug fix that you want to integrate into your system, simply run these commands in your terminal inside this folder:

1. **Fetch the original developer's latest changes:**
   ```bash
   git fetch upstream
   ```

2. **Merge their default branch into your current branch:**
   ```bash
   git merge upstream/main
   ```
   *(If you get a merge conflict, it means their new code overlaps directly with your custom UUID edits. You will need to review the files, accept your UUID lines, and save).*

3. **Push the integrated code up to your personal GitHub:**
   ```bash
   git push origin main
   ```

### Next Deployment
After updating, you simply SSH into the Mac Mini, navigate to your `/omnifocus-mcp-enhanced` directory, and run `git pull` followed by `npm run build`!
