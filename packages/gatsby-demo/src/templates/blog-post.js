import React from "react"
import { Link, graphql } from "gatsby"

import Bio from "../components/bio"
import Layout from "../components/layout"
import SEO from "../components/seo"
import { rhythm, scale } from "../utils/typography"
import { useCMS, FormBuilder } from "@forestryio/cms"

function useCMSForm(options) {
  let cms = useCMS()
  let [form, setForm] = React.useState(null)
  let [values, setValues] = React.useState(options.initialValues)

  let reloadValues = React.useCallback(() => {
    setValues(cms.forms.findForm(options.name).values)
  }, [setValues, cms])

  React.useEffect(function createForm() {
    let form = cms.forms.createForm(options)
    form.subscribe(reloadValues)
    setForm(form)
    setValues(form.values)
    return () => form.unsubscribe(reloadValues)
  }, [])

  return [form, values]
}

function BlogPostTemplate(props) {
  const post = props.data.markdownRemark
  const siteTitle = props.data.site.siteMetadata.title
  const { previous, next } = props.pageContext
  const [form, values] = useCMSForm({
    name: `markdownRemark:${post.slug}`,
    initialValues: post,
    fields: [
      { name: "frontmatter.title", component: "text" },
      { name: "frontmatter.date", component: "text" },
    ],
    onSubmit() {
      console.log("Test")
    },
  })
  return (
    <Layout location={props.location} title={siteTitle}>
      <SEO
        title={values.frontmatter.title}
        description={post.frontmatter.description || post.excerpt}
      />
      <h1
        style={{
          marginTop: rhythm(1),
          marginBottom: 0,
        }}
      >
        {values.frontmatter.title}
      </h1>
      <hr />
      {form && <FormBuilder form={form} />}
      <hr />
      <p
        style={{
          ...scale(-1 / 5),
          display: `block`,
          marginBottom: rhythm(1),
        }}
      >
        {values.frontmatter.date}
      </p>
      <div dangerouslySetInnerHTML={{ __html: post.html }} />
      <hr
        style={{
          marginBottom: rhythm(1),
        }}
      />
      <Bio />

      <ul
        style={{
          display: `flex`,
          flexWrap: `wrap`,
          justifyContent: `space-between`,
          listStyle: `none`,
          padding: 0,
        }}
      >
        <li>
          {previous && (
            <Link to={previous.fields.slug} rel="prev">
              ← {previous.frontmatter.title}
            </Link>
          )}
        </li>
        <li>
          {next && (
            <Link to={next.fields.slug} rel="next">
              {next.frontmatter.title} →
            </Link>
          )}
        </li>
      </ul>
    </Layout>
  )
}

export default BlogPostTemplate

export const pageQuery = graphql`
  query BlogPostBySlug($slug: String!) {
    site {
      siteMetadata {
        title
        author
      }
    }
    markdownRemark(fields: { slug: { eq: $slug } }) {
      id
      excerpt(pruneLength: 160)
      html
      frontmatter {
        title
        date(formatString: "MMMM DD, YYYY")
        description
      }
    }
  }
`
