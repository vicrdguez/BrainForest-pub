import React from 'react'
import Head from 'next/head'
import {getAllPaths} from 'utils/org.server'
import octokit from 'utils/octokit'
import Link from 'components/link'
import Rehype from 'components/rehype'
import {GetServerSideProps, GetStaticProps} from 'next'
import {map} from 'lodash'
import Articles from 'components/articles'
import {getPost} from 'utils/post.server'

const Note = ({title, hast, backlinks}: any) => {
  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>
      <main className="markdown">
        <h1 className="">{title}</h1>
        <div className="article-width">
          <Rehype hast={hast} />
        </div>
      </main>
      {!!backlinks?.length && (
        <section className="article-width">
          <h2>{'Backlinks'}</h2>
          <Articles articles={backlinks} />
        </section>
      )}
    </>
  )
}
export default Note

export const getStaticPaths = async () => {
  const slugs = await getAllPaths()
  // add '/' which is synonymous to '/index'
  return {
    paths: slugs.map((s) => `/${s}`),
    fallback: false,
  }
}

interface Props {}

interface Backlink {
  path: string
  data: {title: string}
  basename: string
}

export const getStaticProps: GetStaticProps<Props> = async ({params}) => {
  const slug =
    typeof params?.slug == 'object' ? params?.slug.join('') : params?.slug
  if (!slug) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    }
  }

  const post = await getPost(octokit, slug)
  const data = post.data

  console.log({post})
  const backlinks = (await Promise.all(
    map(data.backlinks, (id) => {
      return getPost(octokit, id.replace(/\//, ''))
    }),
  )) as any
  return {
    props: {
      title: data.title || post.basename,
      hast: post.result,
      backlinks: backlinks.map((b: any) => ({
        slug: b.data.slug,
        title: b.data.title || b.basename,
      })),
    },
  }
}
