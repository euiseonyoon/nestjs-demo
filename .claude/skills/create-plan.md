---
name: create-plan
description: Convert code review results into structured plan documents with checkboxes and verification steps
---

# Create Plan from Review

Convert TypeScript/NestJS code review results into a structured, actionable plan document.

## Purpose
Automatically transform code review feedback into organized plan files with:
- Prioritized issues (🔴 Critical, 🟡 Important)
- Checkboxes for tracking progress
- Before/After code examples
- Phase-based implementation checklist
- Verification commands

## Input
Provide the review results in the conversation context. The skill will extract:
- Critical Issues (🔴) with location, reasoning, and fixes
- Important Improvements (🟡) with impact and code examples
- Target file path

## Process
1. **Parse Review Results**: Extract issues from review output
2. **Generate Filename**: Create timestamped filename with content description
   - Format: `YYYY-M-D-HH-MM-[content-summary].md`
   - Example: `2026-1-8-15-35-typescript-review-improvements.md`
3. **Structure Document**: Organize into sections with checkboxes
4. **Add Code Examples**: Include Before/After comparisons
5. **Create Checklist**: Group tasks into implementation phases
6. **Save File**: Write to `.claude/plans/` directory

## Output Format

### File Structure
```markdown
# [Title] 개선 사항 적용

**작성일시**: YYYY년 M월 D일 HH:MM
**대상 파일**: `path/to/file`
**목적**: [Brief description]

---

## 📋 목차
1. [Critical Issues](#critical-issues)
2. [Important Improvements](#important-improvements)
3. [Implementation Checklist](#implementation-checklist)
4. [Verification Steps](#verification-steps)

---

## 🔴 Critical Issues

### 1. [Issue Title]
**위치**: Line numbers
**이유**: Why this is problematic
**영향도**: High/Medium/Low - Impact description

**변경 내용**:
- [ ] Specific change 1
- [ ] Specific change 2
```typescript
// ❌ Before
[problematic code]

// ✅ After
[improved code]
```

---

## 🟡 Important Improvements

### 2. [Improvement Title]
**위치**: Line numbers
**이유**: Why improvement matters
**영향도**: Impact level

**변경 내용**:
- [ ] Change description
```typescript
// Before
[current code]

// After
[improved code]
```

---

## ✅ Implementation Checklist

### Phase 1: Critical Issues
- [ ] **1.1** Task description
- [ ] **1.2** Task description

### Phase 2: Important Improvements
- [ ] **2.1** Task description

### Phase 3: Verification
- [ ] **3.1** TypeScript compile check
- [ ] **3.2** Test execution
- [ ] **3.3** Lint check

---

## 🧪 Verification Steps

1. **컴파일 체크**
```bash
npm run build
```

2. **타입 체크**
```bash
npx tsc --noEmit
```

3. **테스트 실행**
```bash
npm test -- [filename].spec.ts
```

4. **Lint 체크**
```bash
npm run lint
```

---

## 📝 Notes
- Additional context or warnings
- Integration considerations
- Follow-up tasks

---

**최종 업데이트**: YYYY-M-D HH:MM
```

## Usage Examples

### Example 1: After TypeScript Review
```
User: "axios-http-client.adapter.ts TypeScript 리뷰해줘"
Claude: [Performs TypeScript review with issues and recommendations]

User: "이 리뷰 결과로 plan 파일 만들어줘"
Claude: [Uses create-plan skill to generate plan document]

Result: .claude/plans/2026-1-8-15-35-typescript-review-improvements.md
```

### Example 2: After NestJS Review
```
User: "user.service.ts NestJS 아키텍처 리뷰 부탁해"
Claude: [Performs NestJS architecture review]

User: "plan 문서 생성해줘"
Claude: [Generates structured plan with DI issues, module structure improvements]

Result: .claude/plans/2026-1-8-16-20-nestjs-architecture-improvements.md
```

## Key Features

✅ **Automatic Timestamping**: Filename includes date and time
✅ **Progress Tracking**: All action items have checkboxes `- [ ]`
✅ **Code Examples**: Before/After comparisons for clarity
✅ **Prioritization**: Critical vs Important issue separation
✅ **Phase Organization**: Tasks grouped by implementation phase
✅ **Verification Commands**: Project-specific test/build commands
✅ **Structured Format**: Consistent, scannable document layout

## Integration

This skill works seamlessly with:
- `/review-ts` - TypeScript code reviewer
- `/review-nest` - NestJS architecture reviewer
- `.claude/agents/review/` - Review agent guidelines

## Notes

- Plan files are saved in `.claude/plans/` directory
- Filename content description is auto-generated from review context
- All checkboxes start unchecked `- [ ]` for progress tracking
- Update checkboxes to `- [x]` as you complete each item
- Verification steps are customized based on project structure
