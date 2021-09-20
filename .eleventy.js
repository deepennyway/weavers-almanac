const Image = require("@11ty/eleventy-img")
const path = require('path')
const yaml = require("js-yaml");

const eleventyNavigationPlugin = require("@11ty/eleventy-navigation");


async function imageCSS(src) {
    let sizes = "(min-width: 1024px) 100vw, 50vw"
    let srcPrefix = `./src/images/`
    src = srcPrefix + src
    console.log(`Generating image(s) from:  ${src}`)
    let metadata = await Image(src, {
      widths: [3000],
      formats: ['webp'],
      urlPath: "/images/",
      outputDir: "./public/images/",
      /* =====
      Now we'll make sure each resulting file's name will 
      make sense to you. **This** is why you need 
      that `path` statement mentioned earlier.
      ===== */
      filenameFormat: function (id, src, width, format, options) {
        const extension = path.extname(src)
        const name = path.basename(src, extension)
        return `${name}-${width}w.${format}`
      }
    })  
    let lowsrc = metadata.webp[0]  
    return `${lowsrc.url}`
  }


async function imageShortcode(src, alt, size) {
    let sizes = "(min-width: 1024px) 100vw, 50vw"
    let srcPrefix = `./src/images/`
    src = srcPrefix + src
    console.log(`Generating image(s) from:  ${src}`)
    if(alt === undefined) {
      // Throw an error on missing alt (alt="" works okay)
      throw new Error(`Missing \`alt\` on responsiveimage from: ${src}`)
    }  
    let metadata = await Image(src, {
      widths: [600],
      formats: ['webp'],
      urlPath: "/images/",
      outputDir: "./public/images/",
      /* =====
      Now we'll make sure each resulting file's name will 
      make sense to you. **This** is why you need 
      that `path` statement mentioned earlier.
      ===== */
      filenameFormat: function (id, src, width, format, options) {
        const extension = path.extname(src)
        const name = path.basename(src, extension)
        return `${name}-${width}w.${format}`
      }
    })  
    let lowsrc = metadata.webp[0]  
    return `<picture class="${size}">
      ${Object.values(metadata).map(imageFormat => {
        return `  <source type="${imageFormat[0].sourceType}" srcset="${imageFormat.map(entry => entry.srcset).join(", ")}" sizes="${sizes}">`
      }).join("\n")}
      <img
        src="${lowsrc.url}"
        width="${lowsrc.width}"
        height="${lowsrc.height}"
        alt="${alt}"
        loading="lazy"
        decoding="async">
    </picture>`
  }
  
module.exports = function (eleventyConfig) {
    eleventyConfig.addWatchTarget("./src/css/")
    eleventyConfig.addPassthroughCopy("./src/css/")
    eleventyConfig.addPassthroughCopy("./src/app-icons/")
    eleventyConfig.addPassthroughCopy("./src/manifest.json")
    eleventyConfig.addWatchTarget("./src/fonts/")
    eleventyConfig.addPassthroughCopy("./src/fonts/")

    eleventyConfig.addPlugin(eleventyNavigationPlugin);

    eleventyConfig.addNunjucksAsyncShortcode("image", imageShortcode)
    eleventyConfig.addLiquidShortcode("image", imageShortcode)
    // === Liquid needed if `markdownTemplateEngine` **isn't** changed from Eleventy default
    eleventyConfig.addJavaScriptFunction("image", imageShortcode)

    eleventyConfig.addNunjucksAsyncShortcode("imagecss", imageCSS)
    eleventyConfig.addLiquidShortcode("imagecss", imageCSS)
    // === Liquid needed if `markdownTemplateEngine` **isn't** changed from Eleventy default
    eleventyConfig.addJavaScriptFunction("imagecss", imageCSS)

    const pluginTOC = require('eleventy-plugin-nesting-toc');
    eleventyConfig.addPlugin(pluginTOC);

    // Example Markdown configuration (to add IDs to the headers)
    const markdownIt = require('markdown-it');
    const markdownItRenderer = new markdownIt();
    const markdownItAnchor = require('markdown-it-anchor');
    eleventyConfig.setLibrary("md",
        markdownIt({
            html: true,
            break: true,
            linkify: true,
            typographer: true,
        }).use(markdownItAnchor, {})
    )
    eleventyConfig.addFilter('markdownify', (str) => {
      return markdownItRenderer.render(str)
    })
    eleventyConfig.addShortcode("byline", (credits, author) => {
      if (!author) {
        return "";
      }
  
      return `${credits.find((c) => c.code === author).byline}`;
    });

    eleventyConfig.addDataExtension("yaml", contents => yaml.load(contents));


    eleventyConfig.addCollection("myCustomSort", function(collection) {
          return collection.getAll().sort(function(a, b) {
            return a.data.sort - b.data.sort;    
          });  
        });
          
    return {
        dir: {
            input: "src", 
            output: "public"
        }
    }
}