#!/usr/bin/env node

/**
 * Integration Test Runner
 * 
 * This script runs comprehensive integration tests for the React Native app
 * to validate all features work correctly with real backend API integration.
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

interface TestResult {
  testFile: string;
  passed: boolean;
  duration: number;
  errors?: string[];
}

interface TestSuite {
  name: string;
  description: string;
  testFiles: string[];
  requirements: string[];
}

const TEST_SUITES: TestSuite[] = [
  {
    name: 'Authentication Integration',
    description: 'Tests authentication flows and token management',
    testFiles: ['AuthIntegration.test.tsx'],
    requirements: ['14.1', '14.2', '2.1', '2.2', '2.3', '2.4', '2.5', '2.6']
  },
  {
    name: 'Data Synchronization',
    description: 'Tests offline/online sync and data consistency',
    testFiles: ['SyncIntegration.test.tsx'],
    requirements: ['14.1', '14.2', '14.3', '14.4', '14.5', '12.1', '12.2', '12.3', '12.4', '12.5']
  },
  {
    name: 'Full App Integration',
    description: 'Tests complete app functionality and cross-feature integration',
    testFiles: ['FullAppIntegration.test.tsx'],
    requirements: ['1.1', '1.3', '1.5', '3.1', '3.2', '3.4', '3.5', '4.1', '4.2', '4.3', '4.4', '4.5']
  },
  {
    name: 'Existing Integration Tests',
    description: 'Runs existing integration tests',
    testFiles: ['AuthFlow.test.tsx', 'HabitFlow.test.tsx'],
    requirements: ['2.1', '2.2', '4.1', '4.2']
  }
];

class IntegrationTestRunner {
  private results: TestResult[] = [];
  private startTime: number = 0;

  async runAllTests(): Promise<void> {
    console.log('🚀 Starting Integration Test Suite');
    console.log('=====================================\n');

    this.startTime = Date.now();

    for (const suite of TEST_SUITES) {
      await this.runTestSuite(suite);
    }

    this.generateReport();
  }

  private async runTestSuite(suite: TestSuite): Promise<void> {
    console.log(`📋 Running ${suite.name}`);
    console.log(`   ${suite.description}`);
    console.log(`   Requirements: ${suite.requirements.join(', ')}`);
    console.log('');

    for (const testFile of suite.testFiles) {
      await this.runTestFile(testFile);
    }

    console.log('');
  }

  private async runTestFile(testFile: string): Promise<void> {
    const testPath = path.join(__dirname, testFile);
    
    if (!fs.existsSync(testPath)) {
      console.log(`⚠️  Test file not found: ${testFile}`);
      this.results.push({
        testFile,
        passed: false,
        duration: 0,
        errors: ['Test file not found']
      });
      return;
    }

    console.log(`   🧪 Running ${testFile}...`);
    
    const startTime = Date.now();
    
    try {
      // Run the test using Jest
      const command = `npx jest ${testPath} --verbose --no-cache --forceExit`;
      const output = execSync(command, { 
        encoding: 'utf8',
        cwd: path.join(__dirname, '../../../..'),
        stdio: 'pipe'
      });
      
      const duration = Date.now() - startTime;
      
      console.log(`   ✅ ${testFile} passed (${duration}ms)`);
      
      this.results.push({
        testFile,
        passed: true,
        duration
      });
      
    } catch (error: any) {
      const duration = Date.now() - startTime;
      const errorOutput = error.stdout || error.stderr || error.message;
      
      console.log(`   ❌ ${testFile} failed (${duration}ms)`);
      console.log(`      Error: ${errorOutput.split('\n')[0]}`);
      
      this.results.push({
        testFile,
        passed: false,
        duration,
        errors: [errorOutput]
      });
    }
  }

  private generateReport(): void {
    const totalDuration = Date.now() - this.startTime;
    const passedTests = this.results.filter(r => r.passed);
    const failedTests = this.results.filter(r => !r.passed);

    console.log('\n📊 Integration Test Report');
    console.log('==========================');
    console.log(`Total Tests: ${this.results.length}`);
    console.log(`Passed: ${passedTests.length}`);
    console.log(`Failed: ${failedTests.length}`);
    console.log(`Total Duration: ${totalDuration}ms`);
    console.log('');

    if (failedTests.length > 0) {
      console.log('❌ Failed Tests:');
      failedTests.forEach(test => {
        console.log(`   - ${test.testFile}`);
        if (test.errors) {
          test.errors.forEach(error => {
            console.log(`     ${error.split('\n')[0]}`);
          });
        }
      });
      console.log('');
    }

    console.log('✅ Passed Tests:');
    passedTests.forEach(test => {
      console.log(`   - ${test.testFile} (${test.duration}ms)`);
    });

    console.log('\n📋 Requirements Coverage:');
    const allRequirements = new Set<string>();
    TEST_SUITES.forEach(suite => {
      suite.requirements.forEach(req => allRequirements.add(req));
    });

    const coveredRequirements = new Set<string>();
    TEST_SUITES.forEach(suite => {
      const suiteHasPassed = suite.testFiles.every(file => 
        this.results.find(r => r.testFile === file)?.passed
      );
      if (suiteHasPassed) {
        suite.requirements.forEach(req => coveredRequirements.add(req));
      }
    });

    console.log(`   Total Requirements: ${allRequirements.size}`);
    console.log(`   Covered: ${coveredRequirements.size}`);
    console.log(`   Coverage: ${Math.round((coveredRequirements.size / allRequirements.size) * 100)}%`);

    // Save detailed report
    this.saveDetailedReport();

    // Exit with appropriate code
    process.exit(failedTests.length > 0 ? 1 : 0);
  }

  private saveDetailedReport(): void {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalTests: this.results.length,
        passed: this.results.filter(r => r.passed).length,
        failed: this.results.filter(r => !r.passed).length,
        duration: Date.now() - this.startTime
      },
      testSuites: TEST_SUITES.map(suite => ({
        ...suite,
        results: suite.testFiles.map(file => 
          this.results.find(r => r.testFile === file)
        )
      })),
      results: this.results
    };

    const reportPath = path.join(__dirname, '../../../reports/integration-test-report.json');
    
    // Ensure reports directory exists
    const reportsDir = path.dirname(reportPath);
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📄 Detailed report saved to: ${reportPath}`);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  const runner = new IntegrationTestRunner();
  runner.runAllTests().catch(error => {
    console.error('❌ Test runner failed:', error);
    process.exit(1);
  });
}

export { IntegrationTestRunner, TestSuite, TestResult };