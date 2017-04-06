function Slide(properties) {
  this.id = null;
  this.credit = '';
  this.type = '';
  this.image_type = '';
  //this.private_data = {
  this.data = {
    //'video-template': {},
    slideType: 'title',
    slideTemplate: null,
    videoSource: null
  };
  this.published = '';
  this.title = '';
  this.caption = '';
  this.image_url_large = '';
  this.image_url_thumb = '';
  this.image = '';
  this.bumper = false;
  // this.template = {};
  Object.keys(properties).forEach((key) => {
    if (properties[key]) {
      this[key] = properties[key];
    }
  });
}

module.exports = Slide;
