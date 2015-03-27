var assert = require('chai').assert;
var H = require('./harness');
var ottoman = H.lib;

describe('Model Queries', function() {

  it('should perform queries successfully', function(done) {
    var userModelId = H.uniqueId('model');
    var postModelId = H.uniqueId('model');

    var UserMdl = ottoman.model(userModelId, {
      name: 'string'
    }, {
      queries: {
        topPosts: {
          of: postModelId,
          by: 'creator'
        }
      }
    });
    var PostMdl = ottoman.model(postModelId, {
      creator: userModelId,
      msg: 'string'
    });

    ottoman.ensureIndices(function (err) {
      assert.isNull(err);

      var ux = new UserMdl();
      ux.name = 'Bob';
      var uy = new UserMdl();
      ux.name = 'Joe';

      var px1 = new PostMdl();
      px1.creator = ux;
      px1.msg = 'Bob Post 1';
      var px2 = new PostMdl();
      px2.creator = ux;
      px2.msg = 'Bob Post 2';
      var py1 = new PostMdl();
      py1.creator = uy;
      py1.msg = 'Joe Post 1';

      H.saveAll([ux, uy, px1, px2, py1], function (err) {
        assert.isNull(err);

        ux.topPosts(function (err, res) {
          assert.isNull(err);
          assert.isArray(res);
          assert.propertyVal(res, 'length', 2);
          var objx1 = null, objx2 = null;
          if (res[0]._id === px1._id) {
            objx1 = res[0];
            objx2 = res[1];
          } else if (res[0]._id === px2._id) {
            objx2 = res[0];
            objx1 = res[1];
          } else {
            assert.fail();
          }

          var objx1 = res[0];
          var objx2 = res[1];
          assert.equal(objx1._id, px1._id);
          assert.equal(objx1.msg, 'Bob Post 1');
          assert.equal(objx2._id, px2._id);
          assert.equal(objx2.msg, 'Bob Post 2');
          done();
        });
      });
    });
  });

  it('should fail queries where the other type is not registered', function(done) {
    var userModelId = H.uniqueId('model');
    var postModelId = H.uniqueId('model');
    var UserMdl = ottoman.model(userModelId, {
      name: 'string'
    }, {
      queries: {
        topPosts: {
          type: 'view',
          of: postModelId,
          by: 'creator'
        }
      }
    });

    ottoman.ensureIndices(function (err) {
      assert.isNull(err);

      var ux = new UserMdl();
      ux.name = 'Bob';

      ux.save(function(err) {
        assert.isNull(err);

        assert.throw(function() {
          ux.topPosts(function(err, res) {
            assert.fail();
          });
        }, Error);

        done();
      });
    });
  });

});
