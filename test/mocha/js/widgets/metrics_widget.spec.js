define([
  'js/widgets/metrics/widget',
  'js/widgets/metrics/edwins_functions',
  'js/components/json_response'
], function(
  MetricsWidget,
  DataExtractor,
  JsonResponse
  ){

  describe("Metrics Widget (UI Widget)", function(){

//query : {"bibcodes":["1980ApJS...44..137K","1980ApJS...44..489B"]}'


    var testData = {
      "all reads": {
        "Average number of downloads": 51.0,
        "Average number of reads": 75.0,
        "Median number of downloads": 51.0,
        "Median number of reads": 75.0,
        "Normalized number of downloads": 90.0,
        "Normalized number of reads": 129.0,
        "Total number of downloads": 102,
        "Total number of reads": 150
      },
      "all stats": {
        "Average citations": 38.5,
        "Average refereed citations": 37.0,
        "H-index": 2,
        "Median citations": 38.5,
        "Median refereed citations": 37.0,
        "Normalized citations": 71.5,
        "Normalized paper count": 1.5,
        "Normalized refereed citations": 69.0,
        "Number of citing papers": 77,
        "Number of papers": 2,
        "Refereed citations": 74,
        "Total citations": 77,
        "e-index": 8.5,
        "g-index": 2,
        "i10-index": 2,
        "i100-index": 0,
        "m-index": 2.0,
        "read10 index": 0,
        "roq index": 1792.0,
        "self-citations": 0,
        "tori index": 3.2
      },
      "citation histogram": {
        "1980": "0:0:0:0:0.0:0.0:0.0:0.0",
        "1981": "4:4:4:4:4.0:4.0:4.0:4.0",
        "1982": "5:5:5:5:4.0:4.0:4.0:4.0",
        "1983": "5:4:5:4:4.0:3.5:4.0:3.5",
        "1984": "3:3:3:3:3.0:3.0:3.0:3.0",
        "1985": "7:7:7:7:7.0:7.0:7.0:7.0",
        "1986": "4:4:4:4:4.0:4.0:4.0:4.0",
        "1987": "8:7:8:7:7.5:6.5:7.5:6.5",
        "1988": "7:7:7:7:7.0:7.0:7.0:7.0",
        "1989": "1:1:1:1:1.0:1.0:1.0:1.0",
        "1990": "5:5:5:5:4.5:4.5:4.5:4.5",
        "1991": "2:2:2:2:2.0:2.0:2.0:2.0",
        "1992": "2:2:2:2:1.5:1.5:1.5:1.5",
        "1993": "1:1:1:1:1.0:1.0:1.0:1.0",
        "1994": "5:5:5:5:4.5:4.5:4.5:4.5",
        "1995": "0:0:0:0:0.0:0.0:0.0:0.0",
        "1996": "3:3:3:3:2.5:2.5:2.5:2.5",
        "1997": "1:1:1:1:1.0:1.0:1.0:1.0",
        "1998": "2:2:2:2:2.0:2.0:2.0:2.0",
        "1999": "3:3:3:3:3.0:3.0:3.0:3.0",
        "2000": "2:1:2:1:2.0:1.0:2.0:1.0",
        "2001": "1:1:1:1:1.0:1.0:1.0:1.0",
        "2002": "2:2:2:2:1.5:1.5:1.5:1.5",
        "2003": "0:0:0:0:0.0:0.0:0.0:0.0",
        "2004": "0:0:0:0:0.0:0.0:0.0:0.0",
        "2005": "0:0:0:0:0.0:0.0:0.0:0.0",
        "2006": "1:1:1:1:1.0:1.0:1.0:1.0",
        "2007": "1:1:1:1:0.5:0.5:0.5:0.5",
        "2008": "0:0:0:0:0.0:0.0:0.0:0.0",
        "2009": "1:1:1:1:1.0:1.0:1.0:1.0",
        "2010": "0:0:0:0:0.0:0.0:0.0:0.0",
        "2011": "0:0:0:0:0.0:0.0:0.0:0.0",
        "2012": "1:1:1:1:1.0:1.0:1.0:1.0",
        "2013": "0:0:0:0:0.0:0.0:0.0:0.0",
        "2014": "0:0:0:0:0.0:0.0:0.0:0.0",
        "type": "citation_histogram"
      },
      "metrics series": {
        "1980": "0:0:0:0:0.0:0:0:0",
        "1981": "1:2:0:0.472023809524:0.5:343:0:0",
        "1982": "2:2:0:0.645851606393:0.666666666667:267:0:0",
        "1983": "2:2:1:1.10189227625:0.5:262:0:0",
        "1984": "2:2:1:1.22747569666:0.4:221:0:0",
        "1985": "2:2:1:1.43852512908:0.333333333333:199:0:0",
        "1986": "2:2:1:1.59290955994:0.285714285714:180:0:0",
        "1987": "2:2:1:2.00479397183:0.25:176:0:0",
        "1988": "2:2:1:2.24667667969:0.222222222222:166:0:0",
        "1989": "2:2:1:2.28667667969:0.2:151:0:0",
        "1990": "2:2:1:2.59707762952:0.181818181818:146:0:0",
        "1991": "2:2:1:2.63106455763:0.166666666667:135:0:0",
        "1992": "2:2:1:2.67899484085:0.153846153846:125:0:0",
        "1993": "2:2:1:2.7316264198:0.142857142857:118:0:0",
        "1994": "2:2:1:2.83935637802:0.133333333333:112:0:0",
        "1995": "2:2:1:2.83935637802:0.125:105:0:0",
        "1996": "2:2:1:2.88540869527:0.117647058824:99:0:0",
        "1997": "2:2:1:2.89969440955:0.111111111111:94:0:0",
        "1998": "2:2:1:2.95326583812:0.105263157895:90:0:0",
        "1999": "2:2:1:2.98340195637:0.1:86:0:0",
        "2000": "2:2:1:3.1525748887:0.0952380952381:84:0:0",
        "2001": "2:2:1:3.16003757527:0.0909090909091:80:0:0",
        "2002": "2:2:2:3.1837423651:0.0869565217391:77:0:0",
        "2003": "2:2:2:3.1837423651:0.0833333333333:74:0:0",
        "2004": "2:2:2:3.1837423651:0.08:71:0:0",
        "2005": "2:2:2:3.1837423651:0.0769230769231:68:0:0",
        "2006": "2:2:2:3.19088522224:0.0740740740741:66:0:0",
        "2007": "2:2:2:3.20199633335:0.0714285714286:63:0:0",
        "2008": "2:2:2:3.20199633335:0.0689655172414:61:0:0",
        "2009": "2:2:2:3.21084589088:0.0666666666667:59:0:0",
        "2010": "2:2:2:3.21084589088:0.0645161290323:57:0:0",
        "2011": "2:2:2:3.21084589088:0.0625:55:0:0",
        "2012": "2:2:2:3.21246663642:0.0606060606061:54:0:0",
        "2013": "2:2:2:3.21246663642:0.0588235294118:52:0:0",
        "2014": "2:2:2:3.21246663642:0.0571428571429:51:0:0",
        "type": "metrics_series"
      },
      "paper histogram": {
        "1980": "2:2:1.5:1.5",
        "type": "publication_histogram"
      },
      "reads histogram": {
        "1996": "0:0:0.0:0.0",
        "1997": "0:0:0.0:0.0",
        "1998": "2:2:2.0:2.0",
        "1999": "7:7:6.0:6.0",
        "2000": "4:4:4.0:4.0",
        "2001": "6:6:5.0:5.0",
        "2002": "15:15:14.5:14.5",
        "2003": "5:5:5.0:5.0",
        "2004": "20:20:17.0:17.0",
        "2005": "4:4:4.0:4.0",
        "2006": "10:10:9.0:9.0",
        "2007": "7:7:6.0:6.0",
        "2008": "15:15:14.0:14.0",
        "2009": "12:12:9.5:9.5",
        "2010": "7:7:5.0:5.0",
        "2011": "12:12:10.5:10.5",
        "2012": "13:13:9.0:9.0",
        "2013": "4:4:3.5:3.5",
        "2014": "7:7:5.0:5.0",
        "type": "reads_histogram"
      },
      "refereed reads": {
        "Average number of downloads": 51.0,
        "Average number of reads": 75.0,
        "Median number of downloads": 51.0,
        "Median number of reads": 75.0,
        "Normalized number of downloads": 90.0,
        "Normalized number of reads": 129.0,
        "Total number of downloads": 102,
        "Total number of reads": 150
      },
      "refereed stats": {
        "Average citations": 38.5,
        "Average refereed citations": 37.0,
        "H-index": 2,
        "Median citations": 38.5,
        "Median refereed citations": 37.0,
        "Normalized citations": 71.5,
        "Normalized paper count": 1.5,
        "Normalized refereed citations": 69.0,
        "Number of citing papers": 77,
        "Number of papers": 2,
        "Refereed citations": 74,
        "Total citations": 77,
        "e-index": 8.5,
        "g-index": 2,
        "i10-index": 2,
        "i100-index": 0,
        "m-index": 2.0,
        "read10 index": 0,
        "roq index": 1792.0,
        "self-citations": 0,
        "tori index": 3.2
      }
    };


    var metricsWidget;

    //first, test Edwin's functions

    it("should have a data extractor object that takes metrics data and prepares json for the nvd3 graph", function(){


      var citshist = DataExtractor.plot_citshist({norm : false, citshist_data : testData["citation histogram"]});

      var norm_citshist =  DataExtractor.plot_citshist({norm : true, citshist_data : testData["citation histogram"]});

      var readshist = DataExtractor.plot_readshist({norm: false, readshist_data : testData["reads histogram"]});

      var norm_readshist  = DataExtractor.plot_readshist({norm: true, readshist_data : testData["reads histogram"]});

      var paperhist = DataExtractor.plot_paperhist({norm : true, paperhist_data : testData["paper histogram"]});

      var norm_paperhist = DataExtractor.plot_paperhist({norm : false, paperhist_data : testData["paper histogram"]});

      var indexes_data = DataExtractor.plot_series({series_data : testData["metrics series"]});

      expect(citshist).to.eql([
      {
        "key": "Ref. citations to ref. papers",
        "values": [
          {
            "x": "1980",
            "y": 0
          },
          {
            "x": "1981",
            "y": 4
          },
          {
            "x": "1982",
            "y": 5
          },
          {
            "x": "1983",
            "y": 4
          },
          {
            "x": "1984",
            "y": 3
          },
          {
            "x": "1985",
            "y": 7
          },
          {
            "x": "1986",
            "y": 4
          },
          {
            "x": "1987",
            "y": 7
          },
          {
            "x": "1988",
            "y": 7
          },
          {
            "x": "1989",
            "y": 1
          },
          {
            "x": "1990",
            "y": 5
          },
          {
            "x": "1991",
            "y": 2
          },
          {
            "x": "1992",
            "y": 2
          },
          {
            "x": "1993",
            "y": 1
          },
          {
            "x": "1994",
            "y": 5
          },
          {
            "x": "1995",
            "y": 0
          },
          {
            "x": "1996",
            "y": 3
          },
          {
            "x": "1997",
            "y": 1
          },
          {
            "x": "1998",
            "y": 2
          },
          {
            "x": "1999",
            "y": 3
          },
          {
            "x": "2000",
            "y": 1
          },
          {
            "x": "2001",
            "y": 1
          },
          {
            "x": "2002",
            "y": 2
          },
          {
            "x": "2003",
            "y": 0
          },
          {
            "x": "2004",
            "y": 0
          },
          {
            "x": "2005",
            "y": 0
          },
          {
            "x": "2006",
            "y": 1
          },
          {
            "x": "2007",
            "y": 1
          },
          {
            "x": "2008",
            "y": 0
          },
          {
            "x": "2009",
            "y": 1
          },
          {
            "x": "2010",
            "y": 0
          },
          {
            "x": "2011",
            "y": 0
          },
          {
            "x": "2012",
            "y": 1
          },
          {
            "x": "2013",
            "y": 0
          },
          {
            "x": "2014",
            "y": 0
          }
        ]
      },
      {
        "key": "Ref. citations to non ref. papers",
        "values": [
          {
            "x": "1980",
            "y": 0
          },
          {
            "x": "1981",
            "y": 0
          },
          {
            "x": "1982",
            "y": 0
          },
          {
            "x": "1983",
            "y": 0
          },
          {
            "x": "1984",
            "y": 0
          },
          {
            "x": "1985",
            "y": 0
          },
          {
            "x": "1986",
            "y": 0
          },
          {
            "x": "1987",
            "y": 0
          },
          {
            "x": "1988",
            "y": 0
          },
          {
            "x": "1989",
            "y": 0
          },
          {
            "x": "1990",
            "y": 0
          },
          {
            "x": "1991",
            "y": 0
          },
          {
            "x": "1992",
            "y": 0
          },
          {
            "x": "1993",
            "y": 0
          },
          {
            "x": "1994",
            "y": 0
          },
          {
            "x": "1995",
            "y": 0
          },
          {
            "x": "1996",
            "y": 0
          },
          {
            "x": "1997",
            "y": 0
          },
          {
            "x": "1998",
            "y": 0
          },
          {
            "x": "1999",
            "y": 0
          },
          {
            "x": "2000",
            "y": 0
          },
          {
            "x": "2001",
            "y": 0
          },
          {
            "x": "2002",
            "y": 0
          },
          {
            "x": "2003",
            "y": 0
          },
          {
            "x": "2004",
            "y": 0
          },
          {
            "x": "2005",
            "y": 0
          },
          {
            "x": "2006",
            "y": 0
          },
          {
            "x": "2007",
            "y": 0
          },
          {
            "x": "2008",
            "y": 0
          },
          {
            "x": "2009",
            "y": 0
          },
          {
            "x": "2010",
            "y": 0
          },
          {
            "x": "2011",
            "y": 0
          },
          {
            "x": "2012",
            "y": 0
          },
          {
            "x": "2013",
            "y": 0
          },
          {
            "x": "2014",
            "y": 0
          }
        ]
      },
      {
        "key": "Non ref. citations to ref. papers",
        "values": [
          {
            "x": "1980",
            "y": 0
          },
          {
            "x": "1981",
            "y": 0
          },
          {
            "x": "1982",
            "y": 0
          },
          {
            "x": "1983",
            "y": 1
          },
          {
            "x": "1984",
            "y": 0
          },
          {
            "x": "1985",
            "y": 0
          },
          {
            "x": "1986",
            "y": 0
          },
          {
            "x": "1987",
            "y": 1
          },
          {
            "x": "1988",
            "y": 0
          },
          {
            "x": "1989",
            "y": 0
          },
          {
            "x": "1990",
            "y": 0
          },
          {
            "x": "1991",
            "y": 0
          },
          {
            "x": "1992",
            "y": 0
          },
          {
            "x": "1993",
            "y": 0
          },
          {
            "x": "1994",
            "y": 0
          },
          {
            "x": "1995",
            "y": 0
          },
          {
            "x": "1996",
            "y": 0
          },
          {
            "x": "1997",
            "y": 0
          },
          {
            "x": "1998",
            "y": 0
          },
          {
            "x": "1999",
            "y": 0
          },
          {
            "x": "2000",
            "y": 1
          },
          {
            "x": "2001",
            "y": 0
          },
          {
            "x": "2002",
            "y": 0
          },
          {
            "x": "2003",
            "y": 0
          },
          {
            "x": "2004",
            "y": 0
          },
          {
            "x": "2005",
            "y": 0
          },
          {
            "x": "2006",
            "y": 0
          },
          {
            "x": "2007",
            "y": 0
          },
          {
            "x": "2008",
            "y": 0
          },
          {
            "x": "2009",
            "y": 0
          },
          {
            "x": "2010",
            "y": 0
          },
          {
            "x": "2011",
            "y": 0
          },
          {
            "x": "2012",
            "y": 0
          },
          {
            "x": "2013",
            "y": 0
          },
          {
            "x": "2014",
            "y": 0
          }
        ]
      },
      {
        "key": "Non ref. citations to non ref. papers",
        "values": [
          {
            "x": "1980",
            "y": 0
          },
          {
            "x": "1981",
            "y": 0
          },
          {
            "x": "1982",
            "y": 0
          },
          {
            "x": "1983",
            "y": 0
          },
          {
            "x": "1984",
            "y": 0
          },
          {
            "x": "1985",
            "y": 0
          },
          {
            "x": "1986",
            "y": 0
          },
          {
            "x": "1987",
            "y": 0
          },
          {
            "x": "1988",
            "y": 0
          },
          {
            "x": "1989",
            "y": 0
          },
          {
            "x": "1990",
            "y": 0
          },
          {
            "x": "1991",
            "y": 0
          },
          {
            "x": "1992",
            "y": 0
          },
          {
            "x": "1993",
            "y": 0
          },
          {
            "x": "1994",
            "y": 0
          },
          {
            "x": "1995",
            "y": 0
          },
          {
            "x": "1996",
            "y": 0
          },
          {
            "x": "1997",
            "y": 0
          },
          {
            "x": "1998",
            "y": 0
          },
          {
            "x": "1999",
            "y": 0
          },
          {
            "x": "2000",
            "y": 0
          },
          {
            "x": "2001",
            "y": 0
          },
          {
            "x": "2002",
            "y": 0
          },
          {
            "x": "2003",
            "y": 0
          },
          {
            "x": "2004",
            "y": 0
          },
          {
            "x": "2005",
            "y": 0
          },
          {
            "x": "2006",
            "y": 0
          },
          {
            "x": "2007",
            "y": 0
          },
          {
            "x": "2008",
            "y": 0
          },
          {
            "x": "2009",
            "y": 0
          },
          {
            "x": "2010",
            "y": 0
          },
          {
            "x": "2011",
            "y": 0
          },
          {
            "x": "2012",
            "y": 0
          },
          {
            "x": "2013",
            "y": 0
          },
          {
            "x": "2014",
            "y": 0
          }
        ]
      }
    ])

     expect(norm_citshist).to.eql([
       {
         "key": "Ref. citations to ref. papers",
         "values": [
           {
             "x": "1980",
             "y": 0
           },
           {
             "x": "1981",
             "y": 4
           },
           {
             "x": "1982",
             "y": 4
           },
           {
             "x": "1983",
             "y": 3.5
           },
           {
             "x": "1984",
             "y": 3
           },
           {
             "x": "1985",
             "y": 7
           },
           {
             "x": "1986",
             "y": 4
           },
           {
             "x": "1987",
             "y": 6.5
           },
           {
             "x": "1988",
             "y": 7
           },
           {
             "x": "1989",
             "y": 1
           },
           {
             "x": "1990",
             "y": 4.5
           },
           {
             "x": "1991",
             "y": 2
           },
           {
             "x": "1992",
             "y": 1.5
           },
           {
             "x": "1993",
             "y": 1
           },
           {
             "x": "1994",
             "y": 4.5
           },
           {
             "x": "1995",
             "y": 0
           },
           {
             "x": "1996",
             "y": 2.5
           },
           {
             "x": "1997",
             "y": 1
           },
           {
             "x": "1998",
             "y": 2
           },
           {
             "x": "1999",
             "y": 3
           },
           {
             "x": "2000",
             "y": 1
           },
           {
             "x": "2001",
             "y": 1
           },
           {
             "x": "2002",
             "y": 1.5
           },
           {
             "x": "2003",
             "y": 0
           },
           {
             "x": "2004",
             "y": 0
           },
           {
             "x": "2005",
             "y": 0
           },
           {
             "x": "2006",
             "y": 1
           },
           {
             "x": "2007",
             "y": 0.5
           },
           {
             "x": "2008",
             "y": 0
           },
           {
             "x": "2009",
             "y": 1
           },
           {
             "x": "2010",
             "y": 0
           },
           {
             "x": "2011",
             "y": 0
           },
           {
             "x": "2012",
             "y": 1
           },
           {
             "x": "2013",
             "y": 0
           },
           {
             "x": "2014",
             "y": 0
           }
         ]
       },
       {
         "key": "Ref. citations to non ref. papers",
         "values": [
           {
             "x": "1980",
             "y": 0
           },
           {
             "x": "1981",
             "y": 0
           },
           {
             "x": "1982",
             "y": 0
           },
           {
             "x": "1983",
             "y": 0
           },
           {
             "x": "1984",
             "y": 0
           },
           {
             "x": "1985",
             "y": 0
           },
           {
             "x": "1986",
             "y": 0
           },
           {
             "x": "1987",
             "y": 0
           },
           {
             "x": "1988",
             "y": 0
           },
           {
             "x": "1989",
             "y": 0
           },
           {
             "x": "1990",
             "y": 0
           },
           {
             "x": "1991",
             "y": 0
           },
           {
             "x": "1992",
             "y": 0
           },
           {
             "x": "1993",
             "y": 0
           },
           {
             "x": "1994",
             "y": 0
           },
           {
             "x": "1995",
             "y": 0
           },
           {
             "x": "1996",
             "y": 0
           },
           {
             "x": "1997",
             "y": 0
           },
           {
             "x": "1998",
             "y": 0
           },
           {
             "x": "1999",
             "y": 0
           },
           {
             "x": "2000",
             "y": 0
           },
           {
             "x": "2001",
             "y": 0
           },
           {
             "x": "2002",
             "y": 0
           },
           {
             "x": "2003",
             "y": 0
           },
           {
             "x": "2004",
             "y": 0
           },
           {
             "x": "2005",
             "y": 0
           },
           {
             "x": "2006",
             "y": 0
           },
           {
             "x": "2007",
             "y": 0
           },
           {
             "x": "2008",
             "y": 0
           },
           {
             "x": "2009",
             "y": 0
           },
           {
             "x": "2010",
             "y": 0
           },
           {
             "x": "2011",
             "y": 0
           },
           {
             "x": "2012",
             "y": 0
           },
           {
             "x": "2013",
             "y": 0
           },
           {
             "x": "2014",
             "y": 0
           }
         ]
       },
       {
         "key": "Non ref. citations to ref. papers",
         "values": [
           {
             "x": "1980",
             "y": 0
           },
           {
             "x": "1981",
             "y": 0
           },
           {
             "x": "1982",
             "y": 0
           },
           {
             "x": "1983",
             "y": 0.5
           },
           {
             "x": "1984",
             "y": 0
           },
           {
             "x": "1985",
             "y": 0
           },
           {
             "x": "1986",
             "y": 0
           },
           {
             "x": "1987",
             "y": 1
           },
           {
             "x": "1988",
             "y": 0
           },
           {
             "x": "1989",
             "y": 0
           },
           {
             "x": "1990",
             "y": 0
           },
           {
             "x": "1991",
             "y": 0
           },
           {
             "x": "1992",
             "y": 0
           },
           {
             "x": "1993",
             "y": 0
           },
           {
             "x": "1994",
             "y": 0
           },
           {
             "x": "1995",
             "y": 0
           },
           {
             "x": "1996",
             "y": 0
           },
           {
             "x": "1997",
             "y": 0
           },
           {
             "x": "1998",
             "y": 0
           },
           {
             "x": "1999",
             "y": 0
           },
           {
             "x": "2000",
             "y": 1
           },
           {
             "x": "2001",
             "y": 0
           },
           {
             "x": "2002",
             "y": 0
           },
           {
             "x": "2003",
             "y": 0
           },
           {
             "x": "2004",
             "y": 0
           },
           {
             "x": "2005",
             "y": 0
           },
           {
             "x": "2006",
             "y": 0
           },
           {
             "x": "2007",
             "y": 0
           },
           {
             "x": "2008",
             "y": 0
           },
           {
             "x": "2009",
             "y": 0
           },
           {
             "x": "2010",
             "y": 0
           },
           {
             "x": "2011",
             "y": 0
           },
           {
             "x": "2012",
             "y": 0
           },
           {
             "x": "2013",
             "y": 0
           },
           {
             "x": "2014",
             "y": 0
           }
         ]
       },
       {
         "key": "Non ref. citations to non ref. papers",
         "values": [
           {
             "x": "1980",
             "y": 0
           },
           {
             "x": "1981",
             "y": 0
           },
           {
             "x": "1982",
             "y": 0
           },
           {
             "x": "1983",
             "y": 0
           },
           {
             "x": "1984",
             "y": 0
           },
           {
             "x": "1985",
             "y": 0
           },
           {
             "x": "1986",
             "y": 0
           },
           {
             "x": "1987",
             "y": 0
           },
           {
             "x": "1988",
             "y": 0
           },
           {
             "x": "1989",
             "y": 0
           },
           {
             "x": "1990",
             "y": 0
           },
           {
             "x": "1991",
             "y": 0
           },
           {
             "x": "1992",
             "y": 0
           },
           {
             "x": "1993",
             "y": 0
           },
           {
             "x": "1994",
             "y": 0
           },
           {
             "x": "1995",
             "y": 0
           },
           {
             "x": "1996",
             "y": 0
           },
           {
             "x": "1997",
             "y": 0
           },
           {
             "x": "1998",
             "y": 0
           },
           {
             "x": "1999",
             "y": 0
           },
           {
             "x": "2000",
             "y": 0
           },
           {
             "x": "2001",
             "y": 0
           },
           {
             "x": "2002",
             "y": 0
           },
           {
             "x": "2003",
             "y": 0
           },
           {
             "x": "2004",
             "y": 0
           },
           {
             "x": "2005",
             "y": 0
           },
           {
             "x": "2006",
             "y": 0
           },
           {
             "x": "2007",
             "y": 0
           },
           {
             "x": "2008",
             "y": 0
           },
           {
             "x": "2009",
             "y": 0
           },
           {
             "x": "2010",
             "y": 0
           },
           {
             "x": "2011",
             "y": 0
           },
           {
             "x": "2012",
             "y": 0
           },
           {
             "x": "2013",
             "y": 0
           },
           {
             "x": "2014",
             "y": 0
           }
         ]
       }
     ])


    })




    it("should have a configurable graph view", function(){

        var metricsWidget = new MetricsWidget();

        var gModel = new metricsWidget.components.GraphModel();

        var graphView = new metricsWidget.components.GraphView({model : gModel });

        graphView.model.set("graphData", DataExtractor.plot_citshist({norm : false, citshist_data : testData["citation histogram"]}));

       $("#test").append(graphView.render().el)



    })

    it("should have a function that creates table views from the raw api response", function(){

      var metricsWidget = new MetricsWidget();

      metricsWidget.processResponse(new JsonResponse(testData));


      //checking a single row from each template
      //would there be a way to check the entire rendered html in a non-messy way?

      expect(metricsWidget.papersTableView.render().$("td:contains(Number of Papers)~td").eq(1).text().trim()).to.eql("2");
      expect(metricsWidget.papersTableView.render().$("td:contains(Number of Papers)~td").eq(2).text().trim()).to.eql("2");

      expect(metricsWidget.readsTableView.render().$("td:contains(Total Number of Downloads)~td").eq(1).text().trim()).to.eql("102");
      expect(metricsWidget.readsTableView.render().$("td:contains(Total Number of Downloads)~td").eq(2).text().trim()).to.eql("102");

      expect(metricsWidget.citationsTableView.render().$("td:contains(Average Refereed Citations)~td").eq(1).text().trim()).to.eql("37");
      expect(metricsWidget.citationsTableView.render().$("td:contains(Average Refereed Citations)~td").eq(2).text().trim()).to.eql("37");

      expect(metricsWidget.indicesTableView.render().$("td:contains(i10-index)~td").eq(1).text().trim()).to.eql("2");
      expect(metricsWidget.indicesTableView.render().$("td:contains(i10-index)~td").eq(2).text().trim()).to.eql("2");


    })

    it("should have a function that creates graph views out of the raw api response", function(){




    })

    it("should have a container view (marionette layout) that arranges the child views", function(){

      var metricsWidget = new MetricsWidget();

      metricsWidget.processResponse(new JsonResponse(testData));

//      $("#test").append(metricsWidget.view.el)



    })


    it("should have a function that creates graph views from the raw api response")










  })





})