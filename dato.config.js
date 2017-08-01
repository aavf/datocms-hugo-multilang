const htmlTag = require('html-tag');

// This function helps transforming structures like:
//
// [{ tagName: 'meta', attributes: { name: 'description', content: 'foobar' } }]
//
// into proper HTML tags:
//
// <meta name="description" content="foobar" />

const toHtml = (tags) => (
  tags.map(({ tagName, attributes, content }) => (
    htmlTag(tagName, attributes, content)
  )).join("")
);

// Arguments that will receive the mapping function:
//
// * dato: lets you easily access any content stored in your DatoCMS
//   administrative area;
//
// * root: represents the root of your project, and exposes commands to
//   easily create local files/directories;
//
// * i18n: allows to switch the current locale to get back content in
//   alternative locales from the first argument.
//
// Read all the details here:
// https://github.com/datocms/js-datocms-client/blob/master/docs/dato-cli.md

module.exports = (dato, root, i18n) => {

  // Create a YAML data file to store global data about the site
  root.createDataFile('data/settings.yml', 'yaml', {
    name: dato.site.globalSeo.siteName,
    language: dato.site.locales[0],
    intro: dato.home.introText,
    copyright: dato.home.copyright,
    // iterate over all the `social_profile` item types
    socialProfiles: dato.socialProfiles.map(profile => {
      return {
        type: profile.profileType.toLowerCase().replace(/ +/, '-'),
        url: profile.url,
      };
    }),
    //aavf faviconMetaTags: toHtml(dato.site.faviconMetaTags),
    //aavf seoMetaTags: toHtml(dato.home.seoMetaTags)
  });


  // iterate over all the available locales...
  i18n.availableLocales.forEach((locale) => {

    // switch to the nth locale
    i18n.withLocale(locale, () => {

      // Create a markdown file with content coming from the `about_page` item
      // type stored in DatoCMS
      root.createPost(`content/about.${locale}.md`, 'yaml', {
        frontmatter: {
          title: dato.aboutPage.title,
          // aavf subtitle: dato.aboutPage.subtitle,
          // aavf photo: dato.aboutPage.photo.url({ w: 800, fm: 'jpg', auto: 'compress' }),
          // aavf seoMetaTags: toHtml(dato.aboutPage.seoMetaTags),
          menu: { main: { weight: 100 } }
        },
        content: dato.aboutPage.content
      });

    });
  });

  // aavf
  // Create a `work` directory (or empty it if already exists)...
  root.directory('content/post', dir => {

    // iterate over all the available locales... aavf
    i18n.availableLocales.forEach((locale) => {

      // switch to the nth locale
      i18n.withLocale(locale, () => {

        // ...and for each of the works stored online...
        dato.posts.forEach((post, index) => {

          var cmsTags = [];
          post.tags.forEach(relatedTag => {
            cmsTags.push(relatedTag.title); // => "Another post!"
          });

          // ...create a markdown file with all the metadata in the frontmatter
          dir.createPost(`${post.slug}.${locale}.md`, 'yaml', {
            frontmatter: {
              title: post.title,
              slug: post.slug,
              //coverImage: post.coverImage.url({ w: 450, fm: 'jpg', auto: 'compress' }),
              //image: post.coverImage.url({ fm: 'jpg', auto: 'compress' }),
              //detailImage: post.coverImage.url({ w: 600, fm: 'jpg', auto: 'compress' }),
              //excerpt: post.excerpt,
              //seoMetaTags: toHtml(post.seoMetaTags),
              weight: index,
              date: post.created,
              lastmod: post.updatedAt,
              tags: cmsTags,
              //tags: [ ".vimrc", "plugins", "spf13-vim", "vim" ],
              //topics: ["topic 1", "top2"],
              //categories: ["cat 1", "cat2"],
              //content: post.content.toMap(),
            },
            content: post.description,
          });
        });

      });
    });

  });
};

