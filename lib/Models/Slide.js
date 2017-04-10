function Slide(properties = {}) {
  this.id = null;
  this.credit = '';
  this.type = '';
  this.image_type = '';
  this.data = {
    slideType: 'title',
    slideTemplate: null,
    videoSource: null,
    crop: null
  };
  this.published = '';
  this.title = '';
  this.caption = '';
  this.image_url_large = '';
  this.image_url_thumb = '';
  this.image = '';
  // this.bumper = false;

  Object.keys(properties).forEach((key) => {
    if (properties[key]) {
      this[key] = properties[key];
    }
  });
}

module.exports = Slide;
