import { SignInButton, useUser } from "@clerk/nextjs";
import { api } from "~/utils/api";
import { useState } from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { type NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import { PostView } from "~/components/postView";
import { LoadingPage, LoadingSpinner } from "~/components/loading";
import { toast } from "react-hot-toast";
import { PageLayout } from "~/components/layout";
dayjs.extend(relativeTime);
//react-hook-form

const Feed = () => {
  const { data, isLoading: postsLoading } = api.posts.getAll.useQuery();

  if(postsLoading) return <LoadingPage/>;

  if(!data) return <div>Something went wrong getting data!</div>

  return(
    <div>
      {data.map((fullPost) => (
        <PostView {...fullPost} key={fullPost.post.id}/>
      ))}
    </div>
  )
}

const Home: NextPage = () => {
  const { isLoaded: userLoaded, isSignedIn } = useUser();
  api.posts.getAll.useQuery();

  if(!userLoaded) return <div />;

  return (
    <>
      <Head>
        <title>Chirp</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <PageLayout>
      <div className="flex border-b border-slate-400 p-4">
        {!isSignedIn && <div className="flex justify-center"><SignInButton /></div>}
        {isSignedIn && <CreatePostWizard/>}
      </div>
      <Feed/>
      </PageLayout>
    </>
  );
};

export default Home;

const CreatePostWizard = () => {
  const { user } = useUser();
  const [input, setInput] = useState("");
  const ctx = api.useContext();
  const { mutate, isLoading: isPosting } = api.posts.create.useMutation({
    onSuccess: () => {
      setInput("");
      void ctx.posts.getAll.invalidate();
    },
    onError: (e) => {
      const errorMessage = e.data?.zodError?.fieldErrors.content;
      if(errorMessage && errorMessage[0]){
        toast.error(errorMessage[0])
      } else {
        toast.error("Failed to post! Post only Emojis!")
      }
    }
  });
  
  if(!user) return null;

  return(
    <div className="flex items-center gap-3 w-full">
      <Image 
        src={user.profileImageUrl}
        height={54}
        width={54}
        className="rounded-full" 
        alt="Profile Image"/>
        <input 
          type="text" 
          placeholder="Type some emojis!"
          className="bg-transparent grow outline-none"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if(e.key === "Enter"){
              e.preventDefault();
              if(input !== ""){
                mutate({ content: input });
              }
            }
          }}
          disabled={isPosting}/>
          
          {input !== "" && !isPosting && 
            <button 
            className="bg-[#1D9BF0] h-fit py-2 px-8 rounded-full"
            onClick={() => mutate({ content: input })}
            disabled={isPosting}>
              Post
          </button>}

          {isPosting && (<div className="mr-8"><LoadingSpinner size={20}/></div>)}
    </div>
  )
}