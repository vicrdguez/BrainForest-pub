import {getAllPosts, getPostBySlug} from './org.server'

const cleanUpSlug = (slug: string | string[]) => {
  if (typeof slug === 'object') {
    return slug.join('')
  }
  return slug
}

const getPost = async (slug: string | string[]) => {
  const cleanedSlug = cleanUpSlug(slug)
  const post = await getPostBySlug(cleanedSlug)
  if (post) {
    const backlinks = Array.from(post.data.backlinks)
    post.data.backlinks = backlinks
    return post
  }
}

const getPosts = async () => {
  const posts = await getAllPosts()
  return posts
}

export {getPost, getPosts}
