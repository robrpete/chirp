import type { RouterOutputs } from "~/utils/api";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);
import Image from "next/image";
import Link from "next/link";

type PostWithUser = RouterOutputs["posts"]["getAll"][number];
export const PostView = (props: PostWithUser) => {
  const { post, author } = props;
  return(
    <div
      key={post.id}
      className="flex border-b border-slate-400 p-4 gap-3"
      >
        <Image 
          src={author.profileImageUrl} 
          alt="Profile image"
          height={54}
          width={54}
          className="rounded-full"/>
        <div className="flex flex-col">
          <div className="flex gap-1 text-slate-400">
            <Link href={`/@${author.username}`}><span className="text-slate-200">{author.username}</span></Link>
            <span>{`@${author.username}`}</span>
            ·
            <Link href={`/post/${post.id}`}><span>{`${dayjs(post.createdAt).fromNow()}`}</span></Link>
          </div>
          <span>{post.content}</span>
        </div>
    </div>
  )
}