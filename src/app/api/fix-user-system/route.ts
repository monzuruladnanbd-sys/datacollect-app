import { NextResponse } from "next/server";
import { UserConsistencyManager } from "@/lib/user-consistency";

export async function POST() {
  try {
    console.log('🔧 === FIXING USER SYSTEM ===');
    
    // 1. Validate current state
    const validation = await UserConsistencyManager.validateUserConsistency();
    console.log('📋 Validation result:', validation);
    
    // 2. Fix issues
    const fixResult = await UserConsistencyManager.fixUserConsistency();
    console.log('🔧 Fix result:', fixResult);
    
    // 3. Re-validate
    const reValidation = await UserConsistencyManager.validateUserConsistency();
    console.log('✅ Re-validation result:', reValidation);
    
    return NextResponse.json({
      success: true,
      message: 'User system fixed successfully',
      validation: validation,
      fixes: fixResult,
      finalValidation: reValidation
    });
  } catch (error) {
    console.error('❌ Error fixing user system:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
