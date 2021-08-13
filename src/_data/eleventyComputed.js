module.exports = {
    eleventyNavigation: {
      key: data => data.title,
      parent: data => data.parent,
      order: data => data.order,
      byline: data => data.byline
    }
  };