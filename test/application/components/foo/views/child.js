define(['lazoView'], function (LazoView) {

    return LazoView.extend({
        child: true,
        getTemplate: function (options) {
            options.success('I am the child template.');
        }
    });

});