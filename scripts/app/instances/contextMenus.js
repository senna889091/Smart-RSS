define([
	'backbone', 'views/ContextMenu', 'views/feedList', 'views/properties'
],
function(BB, ContextMenu, properties) {
	var sourcesContextMenu = new ContextMenu([
		{
			title: bg.lang.c.UPDATE,
			icon: 'reload.png',
			action: function() {
				bg.downloadOne(sourcesContextMenu.currentSource);
			}
		},
		{
			title: bg.lang.c.MARK_ALL_AS_READ,
			icon: 'read.png',
			action: function() {
				if (!sourcesContextMenu.currentSource) return;
				var id = sourcesContextMenu.currentSource.get('id');
				bg.items.forEach(function(item) {
					if (item.get('unread') == true && item.getSource().id == id) {
						item.save({
							unread: false,
							visited: true
						});
					}
				});

				sourcesContextMenu.currentSource.save({ hasNew: false });
			}
		},
		{
			title: bg.lang.c.DELETE,
			icon: 'delete.png',
			action: function() {
				if (confirm(bg.lang.c.REALLY_DELETE)) {
					sourcesContextMenu.currentSource.destroy();
				}
				
			}
		},
		{
			title: bg.lang.c.PROPERTIES,
			icon: 'properties.png',
			action: function() {
				var properties = app.feeds.properties;
				properties.show(sourcesContextMenu.currentSource);
				properties.currentSource = sourcesContextMenu.currentSource;
			}
		}
	]);

	var trashContextMenu = new ContextMenu([
		{
			title: bg.lang.c.MARK_ALL_AS_READ,
			icon: 'read.png',
			action: function() {
				bg.items.where({ trashed: true, deleted: false }).forEach(function(item) {
					if (item.get('unread') == true) {
						item.save({
							unread: false,
							visited: true
						});
					}
				});
			}
		},
		{
			title: bg.lang.c.EMPTY_TRASH,
			icon: 'delete.png',
			action: function() {
				if (confirm(bg.lang.c.REALLY_EMPTY_TRASH)) {
					bg.items.where({ trashed: true, deleted: false }).forEach(function(item) {
						item.markAsDeleted();
					});
				}
			}
		}
	]);

	var allFeedsContextMenu = new ContextMenu([
		{
			title: bg.lang.c.UPDATE_ALL,
			icon: 'reload.png',
			action: function() {
				bg.downloadAll(true);
			}
		},
		{
			title: bg.lang.c.MARK_ALL_AS_READ,
			icon: 'read.png',
			action: function() {
				if (confirm(bg.lang.c.MARK_ALL_QUESTION)) {
					bg.items.forEach(function(item) {
						item.save({ unread: false, visited: true });
					});
				}
			}
		},
		{
			title: bg.lang.c.DELETE_ALL_ARTICLES,
			icon: 'delete.png',
			action: function() {
				if (confirm(bg.lang.c.DELETE_ALL_Q)) {
					bg.items.forEach(function(item) {
						if (item.get('deleted') == true) return;
						item.markAsDeleted();
					});
				}
			}
		}
	]);

	var folderContextMenu = new ContextMenu([
		{
			title: bg.lang.c.UPDATE,
			icon: 'reload.png',
			action: function() {
				var folder = require('views/feedList').selectedItems[0].model;
				if (!folder || !(folder instanceof bg.Folder)) return;

				bg.sources.forEach(function(source) {
					if (source.get('folderID') == folder.id) {
						bg.downloadOne(source);
					}
				});
				bg.downloadOne(sourcesContextMenu.currentSource);
			}
		},
		{
			title: bg.lang.c.MARK_ALL_AS_READ,
			icon: 'read.png',
			action: function() {
				var folder = require('views/feedList').selectedItems[0].model;
				if (!folder || !(folder instanceof bg.Folder)) return;

				var sources = bg.sources.where({ folderID: folder.get('id') });
				if (!sources.length) return;

				var i;
				var markItemAsRead = function(item) {
					if (item.get('unread') == true && item.getSource() == sources[i]) {
						item.save({
							unread: false,
							visited: true
						});
					}
				};

				for (i=0; i<sources.length; i++) {
					bg.items.forEach(markItemAsRead);
					sources[i].save({ hasNew: false });
				}
			}
		},
		{
			title: bg.lang.c.DELETE,
			icon: 'delete.png',
			action: function() {
				if (!confirm(bg.lang.c.REALLY_DELETE)) return;

				var folder = require('views/feedList').selectedItems[0].model;
				bg.sources.where({ folderID: folder.get('id') }).forEach(function(item) {
					item.destroy();
				});
				folder.destroy();
			}
		},
		{
			title: bg.lang.c.RENAME,
			action: function() {
				var feedList = require('views/feedList');
				var newTitle = prompt(bg.lang.c.FOLDER_NAME + ': ', feedList.selectedItems[0].model.get('title'));
				if (!newTitle) return;

				feedList.selectedItems[0].model.save({ title: newTitle });
			}
		}
	]);

	var itemsContextMenu = new ContextMenu([
		{
			title: bg.lang.c.NEXT_UNREAD + ' (H)',
			icon: 'forward.png',
			action: function() {
				app.actions.execute('articles:nextUnread');
			}
		},
		{
			title: bg.lang.c.PREV_UNREAD + ' (Y)',
			icon: 'back.png',
			action: function() {
				app.actions.execute('articles:prevUnread');
			}
		},
		{
			title: bg.lang.c.MARK_AS_READ + ' (K)',
			icon: 'read.png',
			action: function() {
				app.actions.execute('articles:mark');
			}
		},
		{
			title: bg.lang.c.MARK_AND_NEXT_UNREAD + ' (G)',
			icon: 'find_next.png',
			action: function() {
				app.actions.execute('articles:markAndNextUnread');
			}
		},
		{
			title: bg.lang.c.MARK_AND_PREV_UNREAD + ' (T)',
			icon: 'find_previous.png',
			action: function() {
				app.actions.execute('articles:markAndPrevUnread');
			}
		},
		{
			title: bg.lang.c.FULL_ARTICLE,
			icon: 'full_article.png',
			action: function(e) {
				app.actions.execute('articles:fullArticle', e);
			}
		},
		{
			title: bg.lang.c.PIN + ' (P)',
			icon: 'pinsource_context.png',
			action: function() {
				app.actions.execute('articles:pin');
			}
		},
		{
			title: bg.lang.c.DELETE + ' (D)',
			icon: 'delete.png',
			action: function(e) {
				app.actions.execute('articles:delete', e);
			}
		},
		{
			title: bg.lang.c.UNDELETE + ' (U)',
			id: 'context-undelete',
			icon: 'undelete.png',
			action: function() {
				app.actions.execute('articles:undelete');
			}
		}
	]);

	var contextMenus = new (BB.View.extend({
		list: {},
		initialize: function() {
			this.list = {
				sources:  sourcesContextMenu,
				trash:    trashContextMenu,
				folder:   folderContextMenu,
				allFeeds: allFeedsContextMenu,
				items:    itemsContextMenu
			};
		},
		get: function(name) {
			if (name in this.list)  {
				return this.list[name];
			}
			return null;
		},
		hideAll: function() {
			Object.keys(this.list).forEach(function(item) {
				this.list[item].hide();
			}, this);
		},
		areActive: function() {
			return Object.keys(this.list).some(function(item) {
				return !!this.list[item].el.parentNode;
			}, this);
		}
	}));

	return contextMenus;
});