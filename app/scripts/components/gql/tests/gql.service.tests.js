describe("GQL Parser", function() {
  // Initialization of the AngularJS application before each test case
  beforeEach(module("components.gql", function ($provide) {
    $provide.value('FilesService', { getFiles: function (params) {}});
    $provide.value('ParticipantsService', { getParticipants: function (params) {}});
  }));
  beforeEach(inject(function($q, FilesService, ParticipantsService) {
    function promise() {
      var deferred = $q.defer();
       deferred.resolve([{
         aggregations: {
           field1: {
             buckets: [
               {key: "A"},
               {key: "B"},
             ]
           }
         }
       }]);
      return deferred.promise;
    }
    sinon.stub(FilesService, "getFiles", promise);
    sinon.stub(ParticipantsService, "getParticipants", promise);
  }));

  describe("Service", function() {
    describe("countNeedle", function() {
      it("return the number of times the needle is found in the stack", inject(function (GqlService) {
        expect(GqlService.countNeedle("abcdabcdaa", "a")).to.eq(4);
      }));
      it("handle empty stacks", inject(function (GqlService) {
        expect(GqlService.countNeedle("", "a")).to.eq(0);
      }));
    });
    describe("isCountOdd", function() {
      it("return true if needle is found an odd number of times", inject(function (GqlService) {
        expect(GqlService.isCountOdd("aaa", "a")).to.be.true;
      }));
      it("return false if needle is found an even number of times", inject(function (GqlService) {
        expect(GqlService.isCountOdd("aa", "a")).to.be.false;
      }));
      it("handle empty stacks", inject(function (GqlService) {
        expect(GqlService.isCountOdd("", "a")).to.be.false;
      }));
    });
    describe("isUnbalanced", function() {
      it("return true if start token needle is found more than end token", inject(function (GqlService) {
        expect(GqlService.isUnbalanced("abc is [values] and bcd is [val", "[", "]")).to.be.true;
      }));
      it("return false if end token is found more than start token", inject(function (GqlService) {
        expect(GqlService.isUnbalanced("abc is [values] and bcd is [val]", "[", "]")).to.be.false;
      }));
      it("handle empty stacks", inject(function (GqlService) {
        expect(GqlService.isUnbalanced("", "[", "]")).to.be.false;
      }));
    });
    describe("contains", function() {
      it("return true if phrase contains substring", inject(function (GqlService) {
        expect(GqlService.contains("this is a phrase", "is")).to.be.true;
      }));
      it("return false if phrase does not contain substring", inject(function (GqlService) {
        expect(GqlService.contains("this is a phrase", "missing")).to.be.false;
      }));
      it("handle empty phrase", inject(function (GqlService) {
        expect(GqlService.contains("", "is")).to.be.false;
      }));
      it("handle empty substring", inject(function (GqlService) {
        expect(GqlService.contains("this is a phrase", "")).to.be.true;
      }));
    });
    describe("getStartOfList", function() {
      it("returns index of last [", inject(function (GqlService) {
        expect(GqlService.getStartOfList("this is a [phrase")).to.eq(11);
        expect(GqlService.getStartOfList("this [is] a [phrase")).to.eq(13);
      }));
    });
    describe("getEndOfList", function() {
      it("returns index of first ]", inject(function (GqlService) {
        expect(GqlService.getEndOfList("this, is, a, phrase]")).to.eq(19);
        expect(GqlService.getEndOfList("this, is] a [phrase]")).to.eq(8);
      }));
      it("handles no match", inject(function (GqlService) {
        expect(GqlService.getEndOfList("this is a phrase")).to.eq(16);
      }));
    });
    describe("getValuesOfList", function() {
      it("returns array of values", inject(function (GqlService) {
        expect(GqlService.getValuesOfList("this, is, a, phrase")).to.eql(["this", "is", "a", "phrase"]);
      }));
      it("handles quoted string", inject(function (GqlService) {
        expect(GqlService.getValuesOfList('"Im a quoted string", string')).to.eql([
          "Im a quoted string",
          "string"]);
      }));
      it("handles empty string", inject(function (GqlService) {
        expect(GqlService.getValuesOfList("")).to.eql([""]);
      }));
    });
    describe("getNeedleFromList", function() {
      it("returns the last value in array", inject(function (GqlService) {
        expect(GqlService.getNeedleFromList("this, is, a, phrase")).to.eq("phrase");
      }));
      it('removes "', inject(function (GqlService) {
        expect(GqlService.getNeedleFromList('this, is, a, "phrase thing')).to.eq("phrase thing");
      }));
      it("removes (", inject(function (GqlService) {
        expect(GqlService.getNeedleFromList("(field")).to.eq("field");
      }));
      it("handles empty string", inject(function (GqlService) {
        expect(GqlService.getNeedleFromList("")).to.be.empty;
      }));
    });
    describe("getParts", function() {
      it("splits a query into active parts", inject(function (GqlService) {
        expect(GqlService.getParts("FIELD OP VALUE")).to.eql({
          field: "FIELD",
          op: "OP",
          needle: "VALUE"
        });
        expect(GqlService.getParts("FIELD OP")).to.eql({
          field: undefined,
          op: "FIELD",
          needle: "OP"
        });
        expect(GqlService.getParts("FIELD")).to.eql({
          field: undefined,
          op: undefined,
          needle: "FIELD"
        });
      }));
      it("strip ( from field", inject(function (GqlService) {
        expect(GqlService.getParts("(FIELD OP VALUE")).to.eql({
          field: "FIELD",
          op: "OP",
          needle: "VALUE"
        });
      }));
      it("handles empty string", inject(function (GqlService) {
        expect(GqlService.getParts("")).to.eql({
          field: undefined,
          op: undefined,
          needle: ""
        });
      }));
    });
    describe("getComplexParts", function() {
      it("splits a query with a list into active parts", inject(function (GqlService) {
        expect(GqlService.getComplexParts("FIELD OP [VALUE1, VALUE2", 10)).to.eql({
          needle: "VALUE2",
          op: "OP",
          field: "FIELD"
        });
      }));
    });
    describe("splitField", function() {
      it("splits a field into doc type and facet", inject(function (GqlService) {
        expect(GqlService.splitField("files.field1")).to.eql({
          docType: "files",
          facet: "field1"
        });
        expect(GqlService.splitField("files.field1.subfield2")).to.eql({
          docType: "files",
          facet: "field1.subfield2"
        });
      }));
    });
    describe("ajaxRequest", function() {
      it("determines if it should call files or participants", inject(function (GqlService) {
        var params = {facets: ["field"],size: 0,filters: {}};
        GqlService.ajaxRequest("files.field");
        expect(GqlService.FilesService.getFiles).to.be.calledWith(params);
        GqlService.ajaxRequest("participants.field");
        expect(GqlService.ParticipantsService.getParticipants).to.be.calledWith(params);
      }));
    });
    describe("parseGrammarError", function() {
      it("returns a list of values from errors", inject(function (GqlService) {
        expect(GqlService.parseGrammarError("FIELD = VALUE AND FIELD ", {
          expected: [
            { "description": "=", "type": "literal", "value": "=" },
            { "description": "!=", "type": "literal", "value": "!=" },
            { "description": "in", "type": "literal", "value": "is" },
            { "description": "is", "type": "literal", "value": "in" }
          ]})).to.eql([
            { field: "=", full: "=" },
            { field: "!=", full: "!=" },
            { field: "is", full: "is" },
            { field: "in", full: "in" }
          ]);
      }));
      it("filters list by needle", inject(function (GqlService) {
        expect(GqlService.parseGrammarError("FIELD = VALUE AND FIELD =", {
          expected: [
            { "description": "=", "type": "literal", "value": "=" },
            { "description": "!=", "type": "literal", "value": "!=" },
            { "description": "in", "type": "literal", "value": "is" },
            { "description": "is", "type": "literal", "value": "in" }
          ]})).to.eql([
            { field: "=", full: "=" },
            { field: "!=", full: "!=" }
          ]);
      }));
    });
    describe("parseList", function() {
      it("handles list", inject(function (GqlService) {
        sinon.spy(GqlService, 'getComplexParts');
        GqlService.parseList("FIELD IN [one","]");
        expect(GqlService.getComplexParts).to.have.returned({
          field: "FIELD",
          op: "IN",
          needle: "one"
        });
      }));
      it("handles list with multiple items", inject(function (GqlService) {
        sinon.spy(GqlService, 'getComplexParts');
        GqlService.parseList("FIELD IN [one,two,three",",four,five]");
        expect(GqlService.getComplexParts).to.have.returned({
          field: "FIELD",
          op: "IN",
          needle: "three"
        });
      }));
      it("handles unfinished list", inject(function (GqlService) {
        sinon.spy(GqlService, 'getComplexParts');
        GqlService.parseList("FIELD IN [one,two,three",",four,five");
        expect(GqlService.getComplexParts).to.have.returned({
          field: "FIELD",
          op: "IN",
          needle: "three"
        });
      }));
      it("handles cursor inside a value", inject(function (GqlService) {
        sinon.spy(GqlService, 'getComplexParts');
        GqlService.parseList("FIELD IN [one,two,thr","ee,four,five");
        expect(GqlService.getComplexParts).to.have.returned({
          field: "FIELD",
          op: "IN",
          needle: "thr"
        });
      }));
    });
  });
});