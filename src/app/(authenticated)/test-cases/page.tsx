'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function TestCasesPage(): JSX.Element {
  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Test Cases</h1>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/projects">Back to Projects</Link>
          </Button>
        </div>
      </div>
      
      <Card>
        <CardContent className="p-8">
          <div className="text-center py-10">
            <div className="mx-auto w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h2 className="text-xl font-medium mb-2">No Project Selected</h2>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              Test cases are organized within projects. Please select a project to view its test cases or create a new project.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild>
                <Link href="/projects">Select a Project</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/projects/new">Create New Project</Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 