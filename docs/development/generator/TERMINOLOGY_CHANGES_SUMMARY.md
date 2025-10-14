# Terminology Changes Summary: "defaults" → "personalInfo"

## Status: Partially Complete

### Completed Changes ✅

#### 1. Backend Types (`functions/src/types/generator.types.ts`)
- ✅ Renamed `GeneratorDefaults` → `PersonalInfo`
- ✅ Renamed `UpdateGeneratorDefaultsData` → `UpdatePersonalInfoData`
- ✅ Updated document ID type: `id: "default"` → `id: "personal-info"`
- ✅ Updated document type: `type: "defaults"` → `type: "personal-info"`
- ✅ Added deprecated type aliases for backward compatibility
- ✅ Updated `GeneratorRequest.defaults` → `GeneratorRequest.personalInfo`

#### 2. Backend Service (`functions/src/services/generator.service.ts`)
- ✅ Renamed `getDefaults()` → `getPersonalInfo()`
- ✅ Renamed `updateDefaults()` → `updatePersonalInfo()`
- ✅ Updated document ID constant: `PERSONAL_INFO_DOC_ID = "personal-info"`
- ✅ Updated `createRequest()` parameter: `defaults` → `personalInfo`
- ✅ Added deprecated method aliases for backward compatibility

### Remaining Changes 🔧

#### 3. Backend API Handlers (`functions/src/generator.ts`)
- ⏳ Update route: `/generator/defaults` → `/generator/personal-info`
- ⏳ Update `handleGetDefaults()` → `handleGetPersonalInfo()`
- ⏳ Update `handleUpdateDefaults()` → `handleUpdatePersonalInfo()`
- ⏳ Update `handleGenerate()` to use `getPersonalInfo()` instead of `getDefaults()`
- ⏳ Update all references from `defaults` → `personalInfo` in request creation
- ⏳ Update validation schema name if needed

#### 4. Frontend Types (`web/src/types/generator.ts`)
- ⏳ Rename `GeneratorDefaults` → `PersonalInfo`
- ⏳ Rename `UpdateDefaultsData` → `UpdatePersonalInfoData`
- ⏳ Update document ID references

#### 5. Frontend API Client (`web/src/api/generator-client.ts`)
- ⏳ Rename `getDefaults()` → `getPersonalInfo()`
- ⏳ Rename `updateDefaults()` → `updatePersonalInfo()`
- ⏳ Update endpoint paths: `/generator/defaults` → `/generator/personal-info`

#### 6. Frontend Components
- ⏳ Search for and update all usages of `getDefaults()` / `updateDefaults()`
- ⏳ Update state variable names from `defaults` to `personalInfo`

#### 7. Firestore Database (MANUAL MIGRATION REQUIRED) ⚠️
**IMPORTANT**: The Firestore document ID needs to be changed manually:
- Current: `generator/default`
- New: `generator/personal-info`

**Migration Options**:

**Option A: Firebase Console (Recommended)**
1. Go to Firestore in Firebase Console
2. Navigate to `generator` collection
3. Find the `default` document
4. Copy all fields
5. Create new document with ID `personal-info`
6. Paste all fields
7. Delete old `default` document

**Option B: Migration Script**
```typescript
// Run once to migrate the document
async function migratePersonalInfoDocument() {
  const db = getFirestore()
  const oldDoc = await db.collection('generator').doc('default').get()

  if (oldDoc.exists) {
    const data = oldDoc.data()

    // Create new document with updated type
    await db.collection('generator').doc('personal-info').set({
      ...data,
      id: 'personal-info',
      type: 'personal-info',
      updatedAt: FieldValue.serverTimestamp()
    })

    // Delete old document
    await db.collection('generator').doc('default').delete()

    console.log('✅ Migrated personal-info document')
  }
}
```

#### 8. Testing
- ⏳ Test `GET /generator/personal-info` endpoint
- ⏳ Test `PUT /generator/personal-info` endpoint
- ⏳ Test generation flow uses new `personalInfo` field
- ⏳ Verify backward compatibility (deprecated methods still work)
- ⏳ Test frontend loads and displays personal info correctly

## Migration Steps (Recommended Order)

1. **Firestore Database Migration** (Do this first!)
   - Follow Option A or B above to migrate the document
   - Verify the new `personal-info` document exists

2. **Backend API Handlers**
   - Update routes in `generator.ts`
   - Update handler function names
   - Update all references to use new service methods

3. **Frontend Changes**
   - Update types
   - Update API client
   - Update components

4. **Testing**
   - Test all endpoints
   - Test full generation flow
   - Verify no regressions

5. **Cleanup** (Optional, after verification)
   - Remove deprecated method aliases from backend
   - Remove deprecated type aliases

## Backward Compatibility

During the migration, both old and new terminology will work:
- Service methods have deprecated aliases (`getDefaults()` calls `getPersonalInfo()`)
- Type aliases exist (`GeneratorDefaults = PersonalInfo`)
- This allows gradual migration without breaking existing code

## Notes

- The backend service layer is fully migrated and backward compatible
- The main remaining work is in the API handlers and frontend
- **Critical**: Firestore document migration must be done manually before deploying backend changes
