var app ={};
// var Memo = Backbone.Model.extend({
//   urlRoot: "/memos",
//   idAttribute: "_id",
//   defaults: {
//     content: ""
//   }
// });

// var memo = new Memo();
// console.log("Before save: " + JSON.stringify(memo));
// console.log("isNew(): " + memo.isNew());

// memo.save({content: "Acroquest"}, {
//   success: function(){
//     console.log("After save(post) memo: " + JSON.stringify(memo));
//     console.log("After save(post) memo.isNew(): " + memo.isNew());
//   }
// }).pipe(function(){
//   memo.set({content: "Acro"});
//   console.log("Before fetch memo: " + JSON.stringify(memo));
//   return memo.fetch({
//     success: function(){
//       console.log("After fecth memo: " + JSON.stringify(memo));
//     }
//   });
// }).pipe(function(){
//   console.log("Before save(put) memo: " + JSON.stringify(memo));
//   return memo.save({content: "Acroquest Technology"}, {
//     success: function(){
//       console.log("After save(put) memo: " + JSON.stringify(memo));
//     }
//   });
// }).done(function(){
//   console.log("Before delete memo: " + JSON.stringify(memo));
//   return memo.destroy({
//     success: function(){
//       console.log("After delete memo: " + JSON.stringify(memo));
//     }
//   });
// });

// console.log("After save: " + JSON.stringify(memo));
// console.log("isNew(): " + memo.isNew());

// var Memo = Backbone.Model.extend({
//   idAttribute: "_id",
//   defaults: {
//     content: ""
//   }
// });

// var MemoList = Backbone.Collection.extend({
//   model: Memo,
//   url: "/memos"
// });


// var memoList = new MemoList();
// console.log("Before collection.length: " + memoList.length);

// var memo = memoList.create({content: "Acrol"}, {
//   success: function(){
//     console.log("After create model: " + JSON.stringify(memoList));
//     console.log("After create collection.length: " + memoList.length);
//   }
// });
// console.log("After model: " + JSON.stringify(memo));
// console.log("After collection.length: " + memoList.length);

//--------------------第2回まで。ここから下が第三回

var Memo = Backbone.Model.extend({
  idAttribute: "_id",
  defaults: {
    title: "",
    content: ""
  },
  validate: function(attr){
    if (attr.content === ""){
      return "content must be not empty.";
    }
  }
});

var MemoList = Backbone.Collection.extend({
  model: Memo,
  url: "/"
});

//ModelとCollectionが発行するイベントを監視するための監視用オブジェクトを作成

// var observer = {
//   showArguments: function(){
//     console.log("+++observer.showArguments: ");
//     _.each(arguments, function(item, index){
//       //console.log(JSON.stringify(arguments));
//       console.log("  +++arguments[" + index + "]: " + JSON.stringify(item));
//     });
//   }
// };
// _.extend(observer, Backbone.Events);
// observer.listenTo(memoList, "all", observer.showArguments);
// var memo = new Memo({content: "AcroQuest"});

// console.log("add");
// memoList.add(memo);

// console.log("change");
// memo.set({content:"Acroquest Technology"});

// console.log("remove");
// memoList.remove(memo);

// console.log("reset");
// memoList.add([new Memo({content:"Acro1"}),new Memo({content:"Acro2"}),new Memo({content:"Acro3"})]);

// console.log("Before reset: " + JSON.stringify(memoList));

// memoList.reset([new Memo({content:"Acro"}), new Memo({content:"Technology"}), new Memo({content:"Acroquest"})]);
// console.log("After reset: " + JSON.stringify(memoList));

// console.log("sort");

// memoList.comparator = function (item) {
//   return item.get("content");
// };
// memoList.sort();

// console.log("After sort: " + JSON.stringify(memoList));

// observer.stopListening();


//Viewの定義（第四回）
var AppView = Backbone.View.extend({
  events: {
    "click #addBtn": "onAdd"
  },
  initialize: function(){
    _.bindAll(this, 'render');
    _.bindAll(this, 'onAdd');

    this.$title = $("#addForm [name='title']");
    this.$content = $("#addForm [name='content']");

    this.collection = new MemoList();
    this.listView = new ListView({el: $("#memoList"), collection: this.collection});
    this.render();
  },
  render: function(){
    this.$title.val('');
    this.$content.val('');
  },
  onAdd: function(){
    this.collection.create({title: this.$title.val(), content: this.$content.val()}, {wait:true});
    this.render();
  }
});

var ListView = Backbone.View.extend({
  initialize: function(){
    this.listenTo(this.collection, "add", this.addItemView);
    var _this = this;
    this.collection.fetch({reset: true}).done(function(){
      _this.render();
    });
  },
  render: function() {
    this.collection.each(function (item){
      this.addItemView(item);
    }, this);
    return this;
  },
  addItemView: function(item) {
    this.$el.append(new ItemView({model: item}).render().el);
  }
});

var ItemView = Backbone.View.extend({
  tmpl: _.template($('#tmpl-itemview').html()),
  events: {
    "click .delete": "onDelete"
  },
  initialize: function(){
    _.bindAll(this, 'onDelete');
    _.bindAll(this, 'onDestroy');
    _.bindAll(this, 'render');
    this.listenTo(this.model, "change", this.render);
    this.listenTo(this.model, "destroy", this.onDestroy);
  },
  onDelete: function(){
    this.model.destroy();
  },
  onDestroy: function(){
    this.remove();
  },
  render: function(){
    this.$el.html(this.tmpl(this.model.toJSON()));
    return this;
  }
});


//第5回 ルーティングの定義
var AppRouter = Backbone.Router.extend({
  routes: {
    "": "home",
    "create": "add",
    ":id/edit": "edit"
  },
  initialize: function(){
    _.binAll(this, "home");
    _.binAll(this, "add");
    _.binAll(this, "edit");
    this.collection = new MemoList();
    this.headerView = new HeaderView({el: $(".navbar")});
    this.editView = new EditView({el: $("#editViewtForm"), collection: this.collection});
    this.listView = new ListView({el: $("#memoList"), collection: this.collection});
  },
  home: function(){
    this.editView.hideView();
  },
  add: function(){
    this.editView.model = new Memo(null, {collection: this.collection});
    this.editView.render();
  },
  edit: function(){
    this.editView.model = this.collection.get(id);
    if(this.editView.model){
      this.editView.render();
    }
  }
});

var HeaderView = Backbone.View.extend({
  events: {
    "click .create":"onCreate"
  },
  initialize: function(){
    _.bindAll("this", "onCreate");
  },
  onCreate: function(){
    app.router.navigate("create", {trigger:true});
  }
});
app.router = new AppRouter();
var appView = new AppView({el:$("#main")});

