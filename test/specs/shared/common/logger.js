describe('logger', function () {

    var logger = null;

    before(function (done) {
        Date.prototype.toISOString = function () {
            return '2012-01-27T12:30:00.000Z';
        };

        requirejs(['castle'], function (castle) {
            castle.test({
                module: 'lib/common/logger',
                globals: [
                    { module: 'lazo', exports: 'LAZO' }
                ],
                callback: function (module) {
                    logger = module;
                    done();
                }
            });
        });
    });

    it('should have error as default level', function () {
        expect(logger.getLevel()).to.be.equal('error');
    });

    it('should change the log level', function () {
        logger.setLevel('warn');
        expect(logger.getLevel()).to.be.equal('warn');
        logger.setLevel('info');
        expect(logger.getLevel()).to.be.equal('info');
        logger.setLevel('debug');
        expect(logger.getLevel()).to.be.equal('debug');
    });

    it('should have console as default sink', function () {
        var sinks = logger.getSinks();
        expect(sinks.console).to.exist;
        expect(sinks.console).to.be.a.function;
    });

    it('should format messages correctly', function (done) {
        var stub = sinon.stub(console, 'log', function () {
        });

        expect(logger.info('Lorem ipsum dolor sit amet')).to.be.equal('2012-01-27T12:30:00.000Z\tINFO\tLorem ipsum dolor sit amet');
        expect(logger.info('Lorem ipsum dolor sit amet %j', {foo: 123, bar: 456})).to.be.equal('2012-01-27T12:30:00.000Z\tINFO\tLorem ipsum dolor sit amet {"foo":123,"bar":456}');
        expect(logger.info('Lorem %s dolor %s amet', 'ipsum', 'sit')).to.be.equal('2012-01-27T12:30:00.000Z\tINFO\tLorem ipsum dolor sit amet');
        expect(logger.info(['TempoAssetUpload.UtilActions', 'upload'], 'Lorem ipsum dolor sit amet')).to.be.equal('2012-01-27T12:30:00.000Z\tINFO\tLorem ipsum dolor sit amet\tTempoAssetUpload.UtilActions.upload');
        expect(logger.info(['TempoAssetUpload.UtilActions', 'upload'], 'Lorem ipsum dolor sit amet %j', {"foo": 123, "bar": 456})).to.be.equal('2012-01-27T12:30:00.000Z\tINFO\tLorem ipsum dolor sit amet {"foo":123,"bar":456}\tTempoAssetUpload.UtilActions.upload');

        setTimeout(function () {
            expect(stub.callCount).to.be.equal(5);
            stub.restore();
            done();
        }, 10);
    });

    it('should call new registered sink', function (done) {
        var stubSink = sinon.stub();

        expect(logger.getSinks()['console']).to.be.a.function;
        logger.addSink('stub', stubSink);
        expect(logger.getSinks()['stub']).to.be.a.function;
        logger.info('Lorem ipsum dolor sit amet');

        setTimeout(function () {
            expect(stubSink).to.be.called.once;
            done();
        }, 0);
    });

    it('should remove registered sink', function () {
        expect(logger.getSinks()['stub']).to.be.a.function;
        logger.removeSink('stub');
        expect(logger.getSinks()['stub']).to.not.exist;
    });

});