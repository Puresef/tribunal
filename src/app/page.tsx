import type { Metadata } from 'next';
import { getClaims, getTopics } from '@/lib/actions';
import type { Claim, Topic } from '@/lib/types';
import BoardClient from '@/components/claims/BoardClient';
import styles from './board.module.css';

export const metadata: Metadata = {
  title: 'The Board',
  description: 'Live-ranked leaderboard of claims scored by community judges across Source, Logic, and Relevance.',
};

export const dynamic = 'force-dynamic';

export default async function BoardPage() {
  let claims: Claim[] = [];
  let topics: Topic[] = [];

  try {
    claims = await getClaims({ limit: 50 });
    topics = await getTopics();
  } catch (error) {
    console.error('Failed to fetch board data:', error);
  }

  return (
    <div className="content-container">
      <div className={styles.boardHeader}>
        <h1 className={styles.title}>The Board</h1>
        <p className={styles.subtitle}>
          Live-ranked claims scored by community judges
        </p>
      </div>

      <BoardClient initialClaims={claims} topics={topics} />
    </div>
  );
}
