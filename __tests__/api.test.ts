import { describe, it, expect } from 'vitest';

describe('API Endpoints', () => {
  const baseUrl = 'http://localhost:3000';

  it('should return normalized Hostaway reviews', async () => {
    const response = await fetch(`${baseUrl}/api/reviews/hostaway?page=1&pageSize=5`);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.status).toBe('success');
    expect(data.data).toHaveProperty('items');
    expect(data.data).toHaveProperty('page');
    expect(data.data).toHaveProperty('pageSize');
    expect(data.data).toHaveProperty('total');
    expect(Array.isArray(data.data.items)).toBe(true);
  });

  it('should return analytics data', async () => {
    const response = await fetch(`${baseUrl}/api/reviews/analytics`);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.status).toBe('success');
    expect(data.data).toHaveProperty('topListings');
    expect(data.data).toHaveProperty('categoryAverages');
    expect(data.data).toHaveProperty('trend');
    expect(data.data).toHaveProperty('issues');
  });

  it('should return listings with stats', async () => {
    const response = await fetch(`${baseUrl}/api/listings`);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.status).toBe('success');
    expect(Array.isArray(data.data)).toBe(true);
  });
});
