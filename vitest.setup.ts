// vitest.setup.ts
import { vi } from 'vitest';

// Mock Supabase client for tests
vi.mock('../src/lib/supabase', async () => {
  const originalModule = await vi.importActual('../src/lib/supabase');

  return {
    ...originalModule,
    supabase: {
      from: vi.fn(() => ({
        insert: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => ({
              data: { id: 'mock-id', ...mockPaper },
              error: null
            }))
          }))
        })),
        select: vi.fn(() => ({
          order: vi.fn(() => ({
            data: [mockPaper],
            error: null
          })),
          eq: vi.fn(() => ({
            single: vi.fn(() => ({
              data: mockPaper,
              error: null
            }))
          }))
        })),
        update: vi.fn(() => ({
          eq: vi.fn(() => ({
            error: null
          }))
        }))
      }))
    }
  };
});

const mockPaper = {
  id: 'mock',
  user_id: 'user1',
  title: 'Test Paper',
  content: 'Lorem ipsum',
  filename: 'test.pdf',
  analysis: {},
  created_at: '2025-08-07T00:00:00Z',
  updated_at: '2025-08-07T00:00:00Z',
};
