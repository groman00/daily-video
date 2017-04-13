function Slide(properties = {}) {
  this.id = null;
  this.credit = '';
  this.type = '';
  this.image_type = '';
  this.data = {
    slideType: 'title',
    slideTemplate: null,
    video: {},
    crop: null
  };
  this.published = '';
  this.title = '';
  this.caption = '';
  this.image_url_large = '';
  this.image_url_thumb = '';
  this.image = '';

  var local;
  var remote;
  Object.keys(properties).forEach((key) => {
    if (properties[key]) {
      local = this[key];
      remote = properties[key];
      this[key] = typeof remote === 'object' ? Object.assign(local, remote) : remote;
    }
  });
}

module.exports = Slide;
