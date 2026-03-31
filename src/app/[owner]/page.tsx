import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { FollowButton } from "@/components/FollowButton";
import { Markdown } from "@/components/Markdown";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

interface Params {
  owner: string;
}

export default async function UserProfilePage({ params }: { params: Promise<Params> }) {
  const { owner } = await params;
  const session = await getServerSession(authOptions);
  
  const isMe = session?.user?.name === owner;

  const user = await prisma.user.findFirst({
    where: {
      name: owner,
    },
    include: {
      repositories: {
        include: {
          files: {
            where: {
              path: {
                equals: "README.md",
              },
            },
          },
          forkedFrom: {
            include: { owner: true }
          },
          _count: {
            select: { stars: true }
          }
        },
        orderBy: {
          updatedAt: "desc",
        },
      },
      actions: {
        orderBy: {
          createdAt: "desc",
        },
        take: 10,
      },
    },
  });

  if (!user) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-canvas text-fg">
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* User Bio */}
          <div className="w-full md:w-1/4 flex-shrink-0">
             <div className="space-y-4 text-center md:text-left">
                <div className="w-64 h-64 bg-header border border-border-subtle rounded-full overflow-hidden shadow-sm mx-auto md:mx-0 group relative cursor-pointer">
                   <div className="absolute inset-0 bg-gh-blue/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-white text-xs font-bold uppercase tracking-widest">Change Avatar</span>
                   </div>
                   <span className="flex items-center justify-center h-full text-4xl font-bold text-gh-gray">
                     {user.name?.[0].toUpperCase() || user.email[0].toUpperCase()}
                   </span>
                </div>
                <div>
                   <h1 className="text-2xl font-black text-fg tracking-tight">{user.name}</h1>
                   <p className="text-gh-gray font-medium opacity-80">{user.email}</p>
                </div>
                
                {isMe && (
                  <button className="w-full py-1.5 text-sm font-bold border border-border-subtle rounded-lg bg-header hover:bg-repo-hover transition-all mb-4 border-b-2 shadow-sm">
                    Edit profile
                  </button>
                )}

                <FollowButton username={owner} />
             </div>
          </div>

          {/* User Repositories & Activity */}
          <div className="flex-1">
             <nav className="flex space-x-6 border-b border-border-muted mb-8 pb-px overflow-x-auto no-scrollbar">
                <Link href={`/${owner}`} className="pb-3 text-sm font-bold border-b-2 border-[#fd8c73] text-fg whitespace-nowrap">
                   Repositories <span className="ml-1.5 px-2 py-0.5 rounded-full text-xs bg-header border border-border-subtle font-bold text-gh-gray">{user.repositories.length}</span>
                </Link>
                <Link href="#" className="pb-3 text-sm font-medium border-b-2 border-transparent text-gh-gray hover:text-fg hover:border-border-muted transition-all whitespace-nowrap">
                   Starred <span className="ml-1.5 px-2 py-0.5 rounded-full text-xs bg-header border border-border-subtle font-bold text-gh-gray">0</span>
                </Link>
             </nav>

             {/* Profile README */}
             {user.repositories.find((r: any) => r.name.toLowerCase() === owner.toLowerCase())?.files[0] && (
               <div className="mb-10 gh-card overflow-hidden hover:border-gh-blue transition-all">
                  <div className="bg-header px-4 py-3 border-b border-border-subtle flex items-center justify-between">
                     <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-bold text-gh-gray uppercase tracking-widest">{owner}</span>
                        <span className="text-gh-gray/30">/</span>
                        <span className="text-[10px] text-gh-gray font-bold italic uppercase tracking-widest opacity-60">README.md</span>
                     </div>
                     <span className="text-[10px] text-gh-blue font-bold tracking-tighter uppercase px-2 py-0.5 bg-gh-blue/10 rounded-full border border-gh-blue/20">Special Repository</span>
                  </div>
                  <div className="p-10 bg-canvas text-fg">
                     <Markdown content={user.repositories.find((r: any) => r.name.toLowerCase() === owner.toLowerCase())!.files[0].content} />
                  </div>
               </div>
             )}
  
             <div className="flex flex-col lg:flex-row gap-12">
                <div className="flex-1 space-y-2">
                  <h3 className="text-xs font-bold text-gh-gray uppercase tracking-widest mb-6">Popular Repositories</h3>
                  {user.repositories.length > 0 ? (
                    user.repositories.map((repo: any) => (
                      <div key={repo.id} className="py-6 border-b border-border-muted last:border-0 group">
                         <div className="flex flex-col mb-1">
                            <div className="flex items-center justify-between">
                               <div className="flex items-center space-x-3">
                                  <Link href={`/repos/${owner}/${repo.name}`} className="text-lg font-bold text-gh-blue hover:underline">
                                    {repo.name}
                                  </Link>
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-header text-gh-gray border border-border-subtle shadow-sm uppercase tracking-wider">
                                    {repo.isPrivate ? "Private" : "Public"}
                                  </span>
                               </div>
                            </div>
                            {repo.forkedFrom && (
                               <p className="text-[10px] text-gh-gray mt-1 opacity-60">
                                  forked from <Link href={`/repos/${repo.forkedFrom.owner.name}/${repo.forkedFrom.name}`} className="text-gh-blue hover:underline">{repo.forkedFrom.owner.name}/{repo.forkedFrom.name}</Link>
                               </p>
                            )}
                         </div>
                         <p className="text-sm text-gh-gray font-medium mt-2 mb-4 leading-relaxed line-clamp-2">{repo.description || "No description provided."}</p>
                         <div className="flex items-center space-x-6 text-xs text-gh-gray font-bold uppercase tracking-wider">
                            <span className="flex items-center group-hover:text-gh-blue transition-colors">
                              <span className="w-3 h-3 rounded-full bg-gh-blue mr-2 shadow-sm animate-pulse"></span> JavaScript
                            </span>
                            {repo._count.stars > 0 && (
                              <span className="flex items-center text-fg">
                                <svg className="w-4 h-4 mr-1 fill-current text-yellow-500" viewBox="0 0 20 20">
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                                {repo._count.stars}
                              </span>
                            )}
                            <span className="opacity-60 lowercase font-medium">Updated on {repo.updatedAt.toLocaleDateString()}</span>
                         </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-20 text-center gh-card bg-header border-dashed">
                      <p className="text-sm text-gh-gray font-medium italic">{user.name} doesn't have any public repositories yet.</p>
                    </div>
                  )}
                </div>

                <div className="w-full lg:w-72 space-y-6">
                   <h3 className="text-xs font-bold text-fg uppercase tracking-widest border-b border-border-muted pb-3 mb-6">Recent activity</h3>
                   {user.actions.length > 0 ? (
                      <div className="space-y-6 relative before:absolute before:left-0 before:top-2 before:bottom-2 before:w-px before:bg-border-muted">
                         {user.actions.map((action: any) => (
                            <div key={action.id} className="text-xs text-gh-gray pl-4 relative">
                               <div className="absolute left-[-4.5px] top-1.5 w-2 h-2 rounded-full bg-border-subtle ring-4 ring-canvas"></div>
                               <p className="font-medium">
                                  <span className="font-bold text-fg">Starred</span> a repository
                               </p>
                               <p className="text-[10px] text-gh-gray/60 mt-1 uppercase font-bold">{new Date(action.createdAt).toLocaleDateString()}</p>
                            </div>
                         ))}
                      </div>
                   ) : (
                      <p className="text-xs text-gh-gray italic opacity-60">No recent activity found.</p>
                   )}
                </div>
             </div>
          </div>
        </div>
      </main>
    </div>
  );
}