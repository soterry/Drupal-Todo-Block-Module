var DrupalCsrfToken = OOP.class(function () {

    this.staticVariable('_csrfToken');
    this.staticMethod('get', function (callback) {
        if (this.static._csrfToken != null) {
            if (callback != null) {
                callback(this.static._csrfToken);
            }
            return;
        }
        var self = this;
        jQuery.ajax({
            url: drupalSettings.path.baseUrl + 'rest/session/token',
            type: 'get',
            success: function (result) {
                self.static._csrfToken = result;
                if (callback != null) {
                    callback(result);
                }
            }
        });
    });

});

var TodoBlock = OOP.class(function () {

    this.variable('_$ele');
    this.event('oninsert');
    this.event('onorder');
    this.event('ondelete');
    this.constructor(function (ele) {
        this.base();
        //
        this._$ele = ele instanceof jQuery ? ele : jQuery(ele);
        //
        var self = this;
        this.$list.children('li').each(function () {
            self._applyTemplateEvents(jQuery(this));
        });
        this.$form.submit(function () {
            self.insert(self.$taskInput.val());
            return false;
        });
        this.$form.find('input[type="button"]').click(function () {
            self.deleteFinished();
        });
    });
    // Property
    this.property('$ele', {
        get: function () {
            return this._$ele;
        }
    });
    this.property('$list', {
        get: function () {
            return this.$ele.find('.todo-list');
        }
    });
    this.property('$form', {
        get: function () {
            return this.$ele.find('form');
        }
    });
    this.property('$taskInput', {
        get: function () {
            return this.$ele.find('[name="task"]');
        }
    });
    this.property('$template', {
        get: function () {
            return this.$list.children('.template');
        }
    });
    this.property('tasks', {
        get: function () {
            var tasks = [];
            this.$list.children('li').each(function () {
                tasks.push({
                    id: jQuery(this).data('id'),
                    task: jQuery(this).find('span').text(),
                    isFinished: jQuery(this).find('input[type="checkbox"]').prop('checked'),
                });
            });
            return tasks;
        }
    });
    // method
    this.method('_getAjaxOptions', function (data, callback) {
        DrupalCsrfToken.get(function (csrkToken) {
            if (callback != null) {
                callback({
                    contentType: 'application/json',
                    headers: {
                        'X-CSRF-TOKEN': csrkToken
                    },
                    dataType: 'json',
                    data: JSON.stringify(data),
                });
            }
        });
    });
    this.method('_cloneTemplate', function () {
        var $template = this.$template.children().clone();
        this._applyTemplateEvents($template);
        return $template;
    });
    this.method('_applyTemplateEvents', function ($template) {
        var self = this;
        $template.find('input[type="checkbox"]').change(function () {
            self.finish(jQuery(this).closest('li').data('id'), this.checked);
        });
        $template.find('input[type="button"]').click(function () {
            self.delete(jQuery(this).closest('li').data('id'));
        });
    });
    this.method('insert', function (task) {
        var self = this;
        this._getAjaxOptions({
            task: task
        }, function (ajaxOptions) {
            ajaxOptions.url = drupalSettings.path.baseUrl + 'todo';
            ajaxOptions.type = 'post';
            ajaxOptions.success = function (result) {
                switch (result.errno) {
                    case 0:
                        self._insert(task, result.id);
                        self.oninsert.invoke(task);
                        self.$taskInput.val('');
                        break;
                    case 2:
                        alert(result.error);
                        break;
                    default:
                        console.log(result.error);
                        break;
                }
            };
            jQuery.ajax(ajaxOptions);
        });
    });
    this.method('_insert', function (task, id) {
        var $template = this._cloneTemplate();
        $template.data('id', id);
        $template.find('span').text(task);
        this.$list.append($template);
    });
    this.method('finish', function (id, isFinished) {
        var self = this;
        this._getAjaxOptions({
            isFinished: isFinished,
        }, function (ajaxOptions) {
            ajaxOptions.url = drupalSettings.path.baseUrl + 'todo/' + id;
            ajaxOptions.type = 'patch';
            ajaxOptions.success = function (result) {
                switch (result.errno) {
                    case 0:
                        self._finish(id, result.isFinished);
                        self.onfinish.invoke(id, result.isFinished);
                        break;
                    case 2:
                        alert(result.error);
                        break;
                    default:
                        console.log(result.error);
                        break;
                }
            };
            jQuery.ajax(ajaxOptions);
        });
    });
    this.method('_finish', function (id, isFinish) {
        this.$list.children().each(function () {
            if (jQuery(this).data('id') == id) {
                jQuery(this).find('input[type="checkbox"]').prop('checked', isFinish);
            }
        });
    });
    this.method('delete', function (id) {
        var self = this;
        this._getAjaxOptions({
            id: id,
        }, function (ajaxOptions) {
            ajaxOptions.url = drupalSettings.path.baseUrl + 'todo/' + id;
            ajaxOptions.type = 'delete';
            ajaxOptions.success = function () {
                self._delete(id);
                self.ondelete.invoke(id);
            };
            jQuery.ajax(ajaxOptions);
        });
    });
    this.method('_delete', function (id) {
        this.$list.children().each(function () {
            if (jQuery(this).data('id') == id) {
                jQuery(this).remove();
            }
        });
    });
    this.method('deleteFinished', function () {
        var tasks = this.tasks;
        var deleteIds = [];
        for (var i = 0; i < tasks.length; i++) {
            var task = tasks[i];
            if (task.isFinished) {
                deleteIds.push(task.id);
            }
        }
        for (var i = 0; i < deleteIds.length; i++) {
            this.delete(deleteIds[i]);
        }
    });
});

jQuery(document).ready(function () {
    var todoBlocks = [];
    jQuery('.todo-block').each(function () {
        var todoBlock = new TodoBlock(this);
        jQuery(this).data('todoBlock', todoBlock);
        todoBlocks.push(todoBlock);
    });
});