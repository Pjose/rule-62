import { requireStaff } from '@/lib/tenant';
import { getPosts } from '@/lib/queries';
import { createAnnouncement, createNewsPost } from '@/actions/posts';
import { Badge, Card, Checkbox, FormAction, Input, Label, PageHeader, SubmitButton, Textarea } from '@/components/ui';
import { PostControls } from '@/components/admin/PostControls';

export const dynamic = 'force-dynamic';

export default async function AdminAnnouncementsPage() {
  const { org } = await requireStaff();
  const announcements = await getPosts(org.id, 'announcement');
  const news = await getPosts(org.id, 'news');

  return (
    <div className="space-y-10">
      <div>
        <PageHeader title="Announcements" description="Time-sensitive updates. Can have an expiration date." />
        <Card className="mb-6">
          <FormAction action={createAnnouncement} className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Label htmlFor="a-title">Title</Label>
              <Input id="a-title" name="title" required />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="a-body">Message</Label>
              <Textarea id="a-body" name="body" required />
            </div>
            <div>
              <Label htmlFor="a-expires">Expires on (optional)</Label>
              <Input id="a-expires" name="expiresAt" type="date" />
            </div>
            <div className="flex items-end">
              <Checkbox name="pinned" label="Pin to top" />
            </div>
            <div className="sm:col-span-2">
              <SubmitButton pendingText="Posting…">Post announcement</SubmitButton>
            </div>
          </FormAction>
        </Card>

        <div className="space-y-3">
          {announcements.map(({ post }) => (
            <Card key={post.id} className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-display text-lg text-ink">{post.title}</h3>
                  {post.pinned && <Badge tone="open">pinned</Badge>}
                </div>
                <p className="text-sm text-ink whitespace-pre-wrap">{post.body}</p>
              </div>
              <PostControls postId={post.id} pinned={post.pinned} />
            </Card>
          ))}
        </div>
      </div>

      <div>
        <h2 className="font-display text-2xl text-ink mb-4">News</h2>
        <Card className="mb-6">
          <FormAction action={createNewsPost} className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Label htmlFor="n-title">Title</Label>
              <Input id="n-title" name="title" required />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="n-body">Story</Label>
              <Textarea id="n-body" name="body" required />
            </div>
            <div className="sm:col-span-2">
              <SubmitButton pendingText="Posting…">Post news</SubmitButton>
            </div>
          </FormAction>
        </Card>

        <div className="space-y-3">
          {news.map(({ post }) => (
            <Card key={post.id} className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-display text-lg text-ink">{post.title}</h3>
                <p className="text-sm text-ink whitespace-pre-wrap">{post.body}</p>
              </div>
              <PostControls postId={post.id} pinned={post.pinned} />
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
