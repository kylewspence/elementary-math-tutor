# PRD and Task Planning Guide: How to Prompt for Architecture-Safe Implementation

*A guide for creating thorough PRDs and task lists that prevent architectural drift and implementation issues*

## 🎯 The Core Problem

Even with detailed planning, we can still end up with:
- **Architectural drift** (new features that don't match existing patterns)
- **Integration issues** (works in isolation but breaks when integrated)
- **Visual inconsistencies** (extra UI elements, different styling)
- **Missing shared components** (reinventing existing functionality)
- **Regression bugs** (new features breaking existing functionality)

The solution is to be more **architecture-defensive** in our planning prompts.

---

## 📋 Phase 1: Architecture Analysis Prompts

### **Prompt Template 1: Existing Architecture Audit**
```
Before we create any PRD or tasks, I need you to:

1. **Audit the existing shared architecture:**
   - List all shared components in src/components/Shared/
   - Document shared hooks and their patterns
   - Identify the most similar existing operation to [NEW FEATURE]
   - Map out the integration points in App.tsx

2. **Analyze consistency patterns:**
   - How do existing operations handle [SPECIFIC BEHAVIOR]?
   - What shared components are used across all operations?
   - What are the exact integration patterns in App.tsx?
   - How is state management handled consistently?

3. **Identify potential drift points:**
   - Where might [NEW FEATURE] be tempted to diverge from patterns?
   - What operation-specific logic exists that shouldn't be shared?
   - What shared logic exists that MUST be reused?

Please provide this analysis BEFORE we write any PRD or tasks.
```

### **Prompt Template 2: Reference Operation Deep Dive**
```
I want to implement [NEW FEATURE]. Before planning:

1. **Pick the most similar existing operation** and explain why
2. **Document that operation's complete architecture:**
   - File structure and naming patterns
   - Component hierarchy and props
   - Hook usage and state management
   - Integration points with shared systems
   - Visual layout and styling patterns

3. **Create a "copy-first" implementation strategy:**
   - What files should be copied directly?
   - What patterns should be replicated exactly?
   - Where are the only places that should differ?
   - What shared components MUST be used?

Use this as the foundation for our PRD and tasks.
```

---

## 📋 Phase 2: PRD Creation Prompts

### **Prompt Template 3: Architecture-First PRD**
```
Create a PRD for [NEW FEATURE] that prioritizes architectural consistency:

**CRITICAL REQUIREMENTS:**
1. **Copy-First Approach:** Explicitly state which existing operation to copy from
2. **Shared Component Mandate:** List every shared component that MUST be used
3. **Integration Requirements:** Detail exact integration points with existing systems
4. **Visual Consistency Rules:** Define what must look identical vs. what can differ
5. **Regression Prevention:** Identify what existing functionality must not break

**PRD STRUCTURE REQUIRED:**
- Executive Summary with architecture-first principle
- Current State Analysis (audit results from Phase 1)
- Implementation Strategy (copy-first approach)
- Success Criteria (behavioral and visual consistency metrics)
- Risk Mitigation (specific architectural drift prevention)

**ANTI-PATTERNS TO CALL OUT:**
- Custom implementations of existing shared functionality
- Visual elements that don't exist in other operations
- Different integration patterns than existing operations
- Operation-specific logic that should be shared
```

### **Prompt Template 4: Risk-Focused PRD Review**
```
Review the PRD and identify potential implementation risks:

1. **Architectural Drift Risks:**
   - Where might developers be tempted to "improve" existing patterns?
   - What shared components might be overlooked?
   - Where could visual inconsistencies creep in?

2. **Integration Failure Points:**
   - What automatic behaviors (like problem generation) might be missed?
   - Where could state management patterns diverge?
   - What mobile-specific behaviors need preservation?

3. **Regression Risk Areas:**
   - What existing operations could be affected?
   - What shared components might break?
   - What session persistence could be disrupted?

Add specific mitigation strategies to the PRD for each identified risk.
```

---

## 📋 Phase 3: Task List Creation Prompts

### **Prompt Template 5: Architecture-Defensive Task Generation**
```
Generate tasks for [NEW FEATURE] with these mandatory requirements:

**TASK STRUCTURE REQUIREMENTS:**
1. **Architecture Audit Task (ALWAYS FIRST):** Document and verify existing patterns
2. **Copy-First Implementation Tasks:** Explicit copying from reference operation
3. **Shared Component Integration Tasks:** Mandatory usage verification
4. **Multi-Layer Testing Tasks:** Visual, behavioral, integration, mobile
5. **Regression Protection Tasks:** Test ALL existing operations

**TASK DETAIL REQUIREMENTS:**
- Every task must reference the specific existing pattern to follow
- Every component task must explicitly require shared component usage
- Every integration task must specify exact integration points
- Every testing task must have specific success criteria

**ANTI-DRIFT ENFORCEMENT:**
- Include "consistency verification" subtasks for visual elements
- Include "pattern compliance" checks for each component
- Include "regression testing" for all existing operations
- Include "architecture review" checkpoints

Generate 20-30 tasks with this level of architectural protection.
```

### **Prompt Template 6: Testing-Heavy Task Review**
```
Review the task list and ensure comprehensive testing coverage:

1. **Visual Consistency Testing:**
   - Are there tasks to verify identical appearance for shared elements?
   - Are there comparison tasks against existing operations?
   - Are there mobile-specific visual tests?

2. **Behavioral Consistency Testing:**
   - Are there tasks to verify identical keyboard navigation?
   - Are there tasks to verify identical submit flows?
   - Are there tasks to verify identical error handling?

3. **Integration Testing:**
   - Are there tasks to verify mode switching works?
   - Are there tasks to verify session persistence?
   - Are there tasks to verify automatic problem generation?

4. **Regression Testing:**
   - Is there a task to test EACH existing operation?
   - Is there a task to test EACH shared component?
   - Is there a task to test the overall app integration?

Add any missing testing tasks to prevent issues from slipping through.
```

---

## 📋 Phase 4: Implementation Guidance Prompts

### **Prompt Template 7: Pre-Implementation Architecture Check**
```
Before starting implementation of [SPECIFIC TASK], verify:

1. **Pattern Compliance:**
   - What existing file/component should this copy from?
   - What shared components must be integrated?
   - What integration points must be preserved?

2. **Consistency Requirements:**
   - What visual elements must match existing operations?
   - What behavioral patterns must be identical?
   - What naming conventions must be followed?

3. **Risk Mitigation:**
   - What could go wrong if we deviate from the pattern?
   - What shared functionality might be accidentally reimplemented?
   - What existing operations could be affected?

Provide specific implementation guidance that prevents drift.
```

### **Prompt Template 8: Post-Implementation Verification**
```
After implementing [SPECIFIC COMPONENT], verify architectural compliance:

1. **Visual Consistency Check:**
   - Does it look identical to [REFERENCE OPERATION] for shared elements?
   - Are there any extra UI elements not present in other operations?
   - Is the styling consistent with existing patterns?

2. **Behavioral Consistency Check:**
   - Does keyboard navigation work identically to other operations?
   - Does the submit flow work identically to other operations?
   - Do error states work identically to other operations?

3. **Integration Compliance Check:**
   - Does it integrate with shared components correctly?
   - Does it follow the same state management patterns?
   - Does it preserve existing app functionality?

Flag any deviations and provide specific fixes to maintain consistency.
```

---

## 🎯 Example: Complete Planning Session

### **Your Prompt:**
```
I want to add a subtraction feature to the math tutor app. Before we create any PRD or tasks:

1. Audit the existing shared architecture and identify patterns
2. Determine which existing operation subtraction should copy from
3. Document the complete architecture of that reference operation
4. Identify potential architectural drift points
5. Create a risk-focused PRD with copy-first strategy
6. Generate architecture-defensive tasks with comprehensive testing
7. Include regression protection for all existing operations

Walk me through each step systematically, and don't move to the next step until the current one is complete and verified.
```

### **My Response Structure:**
1. **Architecture Audit:** Complete analysis of shared components and patterns
2. **Reference Operation Selection:** Addition (most similar to subtraction)
3. **Reference Architecture Documentation:** Complete AdditionDisplay analysis
4. **Risk Identification:** Specific drift points and mitigation strategies
5. **Architecture-First PRD:** Copy-first approach with consistency requirements
6. **Defensive Task List:** 25+ tasks with multi-layer testing and regression protection
7. **Implementation Guidance:** Step-by-step architectural compliance verification

---

## 🚀 Key Success Patterns

### **What Makes This Approach Work:**

1. **Architecture-First Mindset:** Every decision prioritizes consistency over innovation
2. **Copy-First Strategy:** Start with existing patterns, modify minimally
3. **Mandatory Shared Components:** Never reimplement existing functionality
4. **Multi-Layer Testing:** Visual, behavioral, integration, and regression testing
5. **Regression Protection:** Explicit testing of ALL existing functionality
6. **Risk-Focused Planning:** Identify and mitigate drift points upfront

### **Red Flags to Watch For:**

- ❌ "Let's improve this while we're at it"
- ❌ "This operation needs something unique"
- ❌ "We can make the UI clearer with extra elements"
- ❌ "Let's refactor this shared component"
- ❌ "We don't need to test existing operations"

### **Green Flags That Indicate Success:**

- ✅ "Copy exactly from [existing operation]"
- ✅ "Use the existing SubmitControls component"
- ✅ "Match the visual layout of [reference operation]"
- ✅ "Test that [existing operation] still works"
- ✅ "Verify behavioral consistency across all operations"

---

## 📖 Template Summary

Use these prompts in sequence for any new feature:

1. **Architecture Audit** (Template 1 & 2)
2. **Risk-Focused PRD** (Template 3 & 4)
3. **Defensive Task List** (Template 5 & 6)
4. **Implementation Guidance** (Template 7 & 8)

This systematic approach transforms feature development from a risky, potentially architecture-breaking process into a safe, consistency-preserving workflow that strengthens rather than fragments your application.

The key insight: **Architecture consistency is not an accident—it must be planned, enforced, and verified at every step.** 