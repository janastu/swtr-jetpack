
// Text swtr component
// handles text annotation on a web page
const TextSwtrView = Backbone.View.extend({
  initialize: function() {
    console.log('el in textswtr', this.el);
    this.annotator = new Annotator(this.el);
    this.annotator.addPlugin('Tags');
    this.annotator.subscribe('annotationCreated', this.annoCreated);
  },
  annoCreated: function(annotation) {
    self.port.emit('annotationCreated', 'text', annotation);
  }
});

// Image swtr component
// handles image annotation on a web page
const ImgSwtrView = Backbone.View.extend({
  initialize: function() {
    anno.makeAnnotatable(this.el);
    anno.addHandler('onAnnotationCreated', this.annoCreated);
  },
  annoCreated: function(annotation) {
    self.port.emit('annotationCreated', 'img', annotation);
  }
});

// the controller; the master view
const Controller = Backbone.View.extend({
  events: {
    'click img': 'imgSwtr'
  },
  initialize: function(opts) {
    console.log('opts', opts);
    if(opts.el) {
      console.log('el in opts', opts.el);
      this.el = opts.el;
    }
    this.textSwtr();
    self.on('detach', function() {
      console.log('detach handler called in worker');
    });
    //self.on('detach', this.cleanUp);
  },
  textSwtr: function() {
    this.text_swtr = new TextSwtrView({el: this.el});
  },
  imgSwtr: function(event) {
    event.preventDefault();
    console.log('initing img swtr on');
    let $img = $(event.currentTarget);
    console.log($img);
    this.img_swtr = new ImgSwtrView({el: $img[0]});
    return false;
  },
  cleanUp: function() {
    console.log('worker recvd detach event');
  }
});

console.log('document', document);
document.body.style.border = "3px solid red";
// initialize the worker!
var swtr_controller = new Controller({el: document.body});
//console.log('swtr_controller', swtr_controller.el);
