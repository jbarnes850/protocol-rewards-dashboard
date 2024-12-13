import { SDKManager } from '../src/lib/sdk-manager';
import { GitHubMetrics, RewardCalculation } from '../src/lib/types';

export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  try {
    // Check if request has authorization header
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response('Unauthorized', { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return new Response('Invalid token', { status: 401 });
    }

    // Get project ID from query params if available
    const url = new URL(req.url);
    const projectId = url.searchParams.get('projectId');

    // Initialize SDK with token and optional project ID
    const sdkManager = new SDKManager();
    await sdkManager.initialize(token, projectId);

    // Get metrics first
    const metrics = await sdkManager.getUserMetrics(projectId);

    // Calculate rewards using metrics
    const rewards = await sdkManager.calculateRewards(metrics, projectId);

    return new Response(JSON.stringify(rewards), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  } catch (error) {
    console.error('Error calculating rewards:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Failed to calculate rewards' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
}
