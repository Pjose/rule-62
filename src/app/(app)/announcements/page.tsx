import { requireMembership } from '@/lib/tenant';
import { getActivePosts } from '@/lib/queries';
import { Badge, Card, EmptyState, PageHeader } from '@/components/ui';

export const dynamic = 'force-dynamic';

function PostList({ posts }: { posts: Awaited<ReturnType<typeof getActivePosts>> }) {
  if (posts.length === 0) return <p className="text-sm text-inkmuted">Nothing here yet.</p>;
  return (
    <div className="space-y-4">
      {posts.map(({ post, author }) => (
        <Card key={post.id}>
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-display text-lg text-ink">{post.title}</h3>
            {post.pinned && <Badge tone="open">pinned</Badge>}
          </div>
          <p className="mt-1 text-ink whitespace-pre-wrap">{post.body}</p>
          <p className="mt-2 text-xs text-inkmuted">
            {author?.displayName ?? 'Admin'} · {post.createdAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </p>
        </Card>
      ))}
    </div>
  );
}

export default async function AnnouncementsPage() {
  const { org } = await requireMembership();
  const announcements = await getActivePosts(org.id, 'announcement');
  const news = await getActivePosts(org.id, 'news');

  return (
    <div className="space-y-10">
      <div>
        <PageHeader title="Announcements" description="Time-sensitive updates from your group's admins." />
        <PostList posts={announcements} />
      </div>
      <div>
        <h2 className="font-display text-2xl text-ink mb-4">News</h2>
        <PostList posts={news} />
      </div>
    </div>
  );
}
