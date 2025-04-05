import 'dart:async';
import 'dart:math';

import 'package:get/get.dart';

import 'model/bet_card_model.dart';
import 'model/question_model.dart';
import 'model/question_option_model.dart';

class CustomBetController extends GetxController {
  final questions = <Question>[].obs;
  Timer? _updateTimer;

  @override
  void onInit() {
    super.onInit();
    // loadDummyData();
    // startDummyUpdates();
    LoadRawData();
  }

  @override
  void onClose() {
    _updateTimer?.cancel();
    super.onClose();
  }

  void startDummyUpdates() {
    _updateTimer = Timer.periodic(const Duration(milliseconds: 800), (timer) {
      final random = Random();

      for (var question in questions) {
        for (var option in question.options) {
          // Randomly toggle suspension
          if (random.nextBool() && random.nextDouble() < 0.1) {
            // 10% chance
            option.backBet = option.backBet.copyWith(
              isSuspended: !option.backBet.isSuspended,
            );
            option.layBet = option.layBet.copyWith(
              isSuspended: !option.layBet.isSuspended,
            );
          }

          // Update odds
          final backOddsChange = random.nextDouble() * 10 - 5; // -5 to +5
          final layOddsChange = random.nextDouble() * 10 - 5;

          option.backBet = option.backBet.copyWith(
            odds: (double.tryParse(option.backBet.odds) ?? 0 + backOddsChange)
                .toStringAsFixed(2),
            stake:
                '${(double.tryParse(option.layBet.stake) ?? 0 + layOddsChange).toStringAsFixed(2)}k',
          );
          option.layBet = option.layBet.copyWith(
            odds: (double.tryParse(option.layBet.odds) ?? 0 + layOddsChange)
                .toStringAsFixed(2),
            stake:
                '${(double.tryParse(option.layBet.stake) ?? 0 + layOddsChange).toStringAsFixed(2)}k',
          );

          // Update sliding text for FANCY section
          // if (option.slidingText != null) {
          //   final newRuns = random.nextInt(200) + 1;
          //   option.slidingText = option.slidingText!.replaceAll(
          //     RegExp(r'\d+(\.\d+)?(?=\s*Runs)'),
          //     '$newRuns.5',
          //   );
          // }
        }
      }

      // Trigger UI update
      questions.refresh();
    });
  }

  void parseAndLoadData(List<String> rawData) {
    final List<Question> parsedQuestions = [];

    // Parse BOOKMAKER data
    final bookmakerData =
        rawData.where((data) => data.contains('BOOK_MAKER')).toList();

    // Handle Bookmaker data
    if (bookmakerData.isNotEmpty) {
      for (final data in bookmakerData) {
        print("data is $data");
        final parts = data.split('|');

        // Skip invalid data
        if (parts.length < 20) continue;

        // Check if it's a valid BOOK_MAKER|BM entry
        if (parts[3] != 'BOOK_MAKER' || parts[4] != 'BM') continue;

        print(' part 3 is ${parts[3]}');

        // Get min/max stakes
        final minBet = double.tryParse(parts[5])?.toInt() ?? 100;
        final maxBet = double.tryParse(parts[6])?.toInt() ?? 50000;

        // Find title after '||'
        String title = parts[14];
        int titleIndex = 14;
        // for (int i = 0; i < parts.length - 1; i++) {
        //   if (parts[i].isEmpty && parts[i + 1].isEmpty) {
        //     titleIndex = i + 2;
        //     title = parts[titleIndex];
        //     break;
        //   }
        // }

        // if (titleIndex == -1) continue;

        final options = <QuestionOption>[];

        // Start parsing team data after title (skip 4 entries)
        for (int i = titleIndex + 5; i < parts.length; i += 13) {
          // if (i + 13 > parts.length) break;

          final teamName = parts[i];
          final backOdds = parts[i + 5];
          final layOdds = parts[i + 7];
          final isSuspended = parts[i + 10] == '1' && parts[i + 11] == '1';

          if (teamName.isNotEmpty) {
            options.add(QuestionOption(
              teamName: teamName,
              backBet: BetCardModel(
                odds: backOdds.isEmpty || backOdds == '0' ? '0' : backOdds,
                stake: maxBet.toString(),
                isBack: true,
                isSuspended: isSuspended,
              ),
              layBet: BetCardModel(
                odds: layOdds.isEmpty || layOdds == '0' ? '0' : layOdds,
                stake: maxBet.toString(),
                isBack: false,
                isSuspended: isSuspended,
              ),
            ));
          }
        }

        if (options.isNotEmpty) {
          parsedQuestions.add(Question(
            title: title,
            minBet: minBet,
            maxBet: maxBet,
            backHeader: 'BACK',
            layHeader: 'LAY',
            options: options,
          ));
        }
      }
    }

    // Filter only FANCY type data
    final fancyData = rawData.where((data) => data.contains('FANCY')).toList();

    if (fancyData.isNotEmpty) {
      final options = <QuestionOption>[];

      for (final data in fancyData) {
        final parts = data.split('|');

        // Skip invalid data
        if (parts.length < 35) continue;

        final title = parts[7];
        final minBet = double.tryParse(parts[8])?.toInt() ?? 100;
        final maxBet = double.tryParse(parts[9])?.toInt() ?? 25000;
        final backOdds = parts[20];
        final backOddsStake = parts[19];
        final layOdds = parts[18];
        final layOddsStake = parts[17];
        final slidingText = parts[40];
        final isSuspended = true; // Based on screenshot, all are suspended

        options.add(QuestionOption(
          teamName: title,
          showStarLeading: true,
          subtitle: 'Min: $minBet | Max: $maxBet',
          slidingText: slidingText,
          backBet: BetCardModel(
            odds: backOdds,
            stake: backOddsStake,
            isBack: true,
            isSuspended: isSuspended,
          ),
          layBet: BetCardModel(
            odds: layOdds,
            stake: layOddsStake,
            isBack: false,
            isSuspended: isSuspended,
          ),
        ));
      }

      if (options.isNotEmpty) {
        parsedQuestions.add(Question(
          title: 'FANCY',
          minBet: 100,
          maxBet: 25000,
          backHeader: 'NO',
          layHeader: 'YES',
          options: options,
        ));
      }
    }

    questions.value = parsedQuestions;
    questions.refresh();
  }

  // Example usage
  void LoadRawData() {
    final rawData = [
      //bookmaker
      // "8.8888451|28127348|49747|BOOK_MAKER|BM|100|50000|900000000|900000000|0|1|0|4|Loksabha Election 2024 Bets Started In Our Exchange|BM CUP WINNER|1|1|8.8888451|104542|Gujarat Titans|28127348|42821394|42821394|49747|0.00|0.00|0.00|0.00|0|0|0|104543|Royal Challengers Bangalore|28127348|4164048|4164048|49747|0.00|0.00|0.00|0.00|0|0|0|104544|Rajasthan Royals|28127348|2954266|2954266|49747|0.00|0.00|0.00|0.00|0|0|0|104545|Mumbai Indians|28127348|2954281|2954281|49747|0.00|0.00|0.00|0.00|0|0|0|104546|Delhi Capitals|28127348|22121561|22121561|49747|0.00|0.00|0.00|0.00|0|0|0|104547|Lucknow Super Giants|28127348|42821393|42821393|49747|0.00|0.00|0.00|0.00|0|0|0|104548|Chennai Super Kings|28127348|2954263|2954263|49747|0.00|0.00|0.00|0.00|0|0|0|104549|Punjab Kings|28127348|38528100|38528100|49747|0.00|0.00|0.00|0.00|0|0|0|104550|Sunrisers Hyderabad|28127348|7671295|7671295|49747|0.00|0.00|0.00|0.00|0|0|0|104551|Kolkata Knight Riders|28127348|2954260|2954260|49747|0.00|0.00|0.00|0.00|0|0|0",

      // "8.88866598|28127348|49748|BOOK_MAKER|BM|100|50000|900000000|900000000|0|0|0|0||BOOKMAKER (IPL CUP WINNER)|1|1|8.88866598|104552|Gujarat Titans|28127348|42821394|42821394|49748|0|0|0|0|1|1|0|104553|Royal Challengers Bangalore|28127348|4164048|4164048|49748|0|0|0|0|1|1|0|104554|Rajasthan Royals|28127348|2954266|2954266|49748|0|0|0|0|1|1|0|104555|Mumbai Indians|28127348|2954281|2954281|49748|0|0|0|0|1|1|0|104556|Delhi Capitals|28127348|22121561|22121561|49748|0|0|0|0|1|1|0|104557|Lucknow Super Giants|28127348|42821393|42821393|49748|0|0|0|0|1|1|0|104558|Chennai Super Kings|28127348|2954263|2954263|49748|0|0|0|0|1|1|0|104559|Punjab Kings|28127348|38528100|38528100|49748|0|0|0|0|1|1|0|104560|Sunrisers Hyderabad|28127348|7671295|7671295|49748|0|0|0|0|1|1|0|104561|Kolkata Knight Riders|28127348|2954260|2954260|49748|96|0|100|0|1|1|0",

      "8.888106671|28127348|91845|BOOK_MAKER|BM|100|50000|900000000|900000000|0|1|0|1||BOOKMAKER (Indian Premier League Cup Winner)|1|1|8.888106671|192693|Mumbai Indians|28127348|2954281|2954281|91845|710|0|910|0|0|0|0|192694|Sunrisers Hyderabad|28127348|7671295|7671295|91845|440|0|490|0|1|1|0|192695|Chennai Super Kings|28127348|2954263|2954263|91845|660|0|760|0|1|1|0|192696|Kolkata Knight Riders|28127348|2954260|2954260|91845|1180|0|1480|0|0|0|0|192697|Gujarat Titans|28127348|42821394|42821394|91845|1020|0|1320|0|0|0|0|192698|Royal Challengers  Bengaluru|28127348|71386514|71386514|91845|430|0|480|0|0|0|0|192699|Delhi Capitals|28127348|22121561|22121561|91845|1200|0|1500|0|1|1|0|192700|Lucknow Super Giants|28127348|42821393|42821393|91845|1270|0|1570|0|0|0|0|192701|Punjab Kings|28127348|38528100|38528100|91845|720|0|820|0|0|0|0|192702|Rajasthan Royals|28127348|2954266|2954266|91845|2000|0|0|0|1|1|0",

      //fancy
      "9.312915742|1686821|168682128127348|28127348|FANCY|F|RUN|Lowest Inning Runs in IPL|100.00|25000.00|90000000.00|90000000.00|0|1|0|1|12915742|100|104|100|99|0|0|0|0|0|0|0|0|1|0|0|1|0|0|1|1|1|1|1|151 Runs (RR) (6th Match)|1|1743340770",
      "9.312915699|1686820|168682028127348|28127348|FANCY|F|RUN|Highest Partnership Runs in IPL|100.00|25000.00|90000000.00|90000000.00|0|1|0|1|12915699|100|184|100|176|0|0|0|0|0|0|0|0|1|0|0|1|0|0|1|1|1|1|1|116 Runs ( M Marsh & N Pooran (LSG)) (7th Match)|1|1743340770",
      "9.312928761|1696090|169609028127348|28127348|FANCY|F|RUN|Highest Inning Runs in IPL2|100.00|25000.00|90000000.00|90000000.00|0|1|0|1|12928761|100|276|100|266|0|0|0|0|0|0|0|0|1|0|0|1|0|0|1|1|1|1|1|243 Runs ( PBKS) (5th Match )|1|1743340770",
      "9.312915743|1686849|168684928127348|28127348|FANCY|F|RUN|Tournament Topbatsman Runs in IPL|100.00|25000.00|90000000.00|90000000.00|0|1|0|1|12915743|100|135|100|130|0|0|0|0|0|0|0|0|1|0|0|1|0|0|1|1|1|1|1|106 runs Ishan Kishan (2nd Match )|1|1743340770",
      "9.312915744|1686850|168685028127348|28127348|FANCY|F|RUN|Highest Run Scorer Runs (Orange Cap)|100.00|25000.00|90000000.00|90000000.00|0|1|0|1|12915744|100|810|100|775|0|0|0|0|0|0|0|0|1|0|0|1|0|0|1|1|1|1|1|145 runs Nicholas Pooran ( 2 Match )|1|1743340770",
      "9.312915745|1686851|168685128127348|28127348|FANCY|F|RUN|Highest Wicket Taker (Purple Cap)|100.00|25000.00|90000000.00|90000000.00|0|1|0|1|12915745|100|29|100|27|0|0|0|0|0|0|0|0|1|0|0|1|0|0|1|1|1|2|1|7 Wicket Noor Ahmad (2 Match)|1|1743340770",
      "9.312915746|1686852|168685228127348|28127348|FANCY|F|RUN|How Many time 5 or More Wickets taken by Bowlers|100.00|25000.00|90000000.00|90000000.00|0|1|0|1|12915746|100|4|100|3|0|0|0|0|0|0|0|0|1|0|0|1|0|0|1|1|1|2|1|0 ( Matches Played :- 8)|1|1743340770",
      "9.312915747|1686853|168685328127348|28127348|FANCY|F|RUN|Fastest 50 of IPL|100.00|25000.00|90000000.00|90000000.00|0|1|0|1|12915747|100|17|100|15|0|0|0|0|0|0|0|0|1|0|0|1|0|0|1|1|1|2|1|18 balls Nicholas Pooran (LSG) ( 7th Match )|1|1743340770",
      "9.312915749|1686854|168685428127348|28127348|FANCY|F|RUN|Total 4's in IPL|100.00|25000.00|90000000.00|90000000.00|0|1|0|1|12915749|100|2280|100|2230|0|0|0|0|0|0|0|0|1|0|0|1|0|0|1|1|1|2|1|288 Four's (Matches Played :- 9 )|1|1743340770",
      "9.312915748|1686855|168685528127348|28127348|FANCY|F|RUN|Fastest 100 of IPL|100.00|25000.00|90000000.00|90000000.00|0|1|0|1|12915748|100|44|100|41|0|0|0|0|0|0|0|0|1|0|0|1|0|0|1|1|1|2|1|45 balls Ishan Kishan (SRH) (2nd Match )|1|1743340770",
      "9.312915750|1686856|168685628127348|28127348|FANCY|F|RUN|Total 6's in IPL|100.00|25000.00|90000000.00|90000000.00|0|1|0|1|12915750|100|1325|100|1275|0|0|0|0|0|0|0|0|1|0|0|1|0|0|1|1|1|2|1|188 Six ( Matches Played :- 9 )|1|1743340770",
      "9.312915751|1686857|168685728127348|28127348|FANCY|F|RUN|Total 30's in IPL|100.00|25000.00|90000000.00|90000000.00|0|1|0|1|12915751|100|191|100|184|0|0|0|0|0|0|0|0|1|0|0|1|0|0|1|1|1|3|1|26 ( Matches Played :-9 )|1|1743340770",
      "9.312915752|1686858|168685828127348|28127348|FANCY|F|RUN|Total 50's in IPL|100.00|25000.00|90000000.00|90000000.00|0|1|0|1|12915752|100|148|100|140|0|0|0|0|0|0|0|0|1|0|0|1|0|0|1|1|1|3|1|19 ( Matches Played :- 9 )|1|1743340770",
      "9.312915753|1686859|168685928127348|28127348|FANCY|F|RUN|Total 100's in IPL|100.00|25000.00|90000000.00|90000000.00|0|1|0|1|12915753|90|12|130|12|0|0|0|0|0|0|0|0|1|0|0|1|0|0|1|1|1|3|1|1 ( Matches Played :- 9 )|1|1743340770",
      "9.312915754|1686860|168686028127348|28127348|FANCY|F|RUN|Total Noballs in IPL|100.00|25000.00|90000000.00|90000000.00|0|1|0|1|12915754|100|84|100|79|0|0|0|0|0|0|0|0|1|0|0|1|0|0|1|1|1|3|1|8 ( Matches Played :- 9 )|1|1743340770",
      "9.312915758|1686864|168686428127348|28127348|FANCY|F|RUN|Total Caught Outs in IPL|100.00|25000.00|90000000.00|90000000.00|0|1|0|1|12915758|100|680|100|650|0|0|0|0|0|0|0|0|1|0|0|1|0|0|1|1|1|4|1|82 (Matches Played :- 9 )|1|1743340770",
      "9.312915759|1686865|168686528127348|28127348|FANCY|F|RUN|Total Bowled in IPL|100.00|25000.00|90000000.00|90000000.00|0|1|0|1|12915759|100|144|100|137|0|0|0|0|0|0|0|0|1|0|0|1|0|0|1|1|1|4|1|22 (Matches Played :- 9 )|1|1743340770",
      "9.312915757|1686863|168686328127348|28127348|FANCY|F|RUN|Total Extras in IPL|100.00|25000.00|90000000.00|90000000.00|0|1|0|1|12915757|100|1395|100|1345|0|0|0|0|0|0|0|0|1|0|0|1|0|0|1|1|1|4|1|170 (Matches Played :- 9 )|1|1743340770",
      "9.312915756|1686862|168686228127348|28127348|FANCY|F|RUN|Total Wides in IPL|100.00|25000.00|90000000.00|90000000.00|0|1|0|1|12915756|100|875|100|845|0|0|0|0|0|0|0|0|1|0|0|1|0|0|1|1|1|4|1|120 (Matches Played :- 9 )|1|1743340770",
      "9.312915755|1686861|168686128127348|28127348|FANCY|F|RUN|Total Wickets in IPL|100.00|25000.00|90000000.00|90000000.00|0|1|0|1|12915755|100|940|100|920|0|0|0|0|0|0|0|0|1|0|0|1|0|0|1|1|1|4|1|119 Wicket (Matches Played :- 9 )|1|1743340770",
      "9.312915760|1686866|168686628127348|28127348|FANCY|F|RUN|Total LBW in IPL|100.00|25000.00|90000000.00|90000000.00|0|1|0|1|12915760|100|58|100|53|0|0|0|0|0|0|0|0|1|0|0|1|0|0|1|1|1|5|1|5 (Matches Played :- 9 )|1|1743340770",
      "9.312915762|1686867|168686728127348|28127348|FANCY|F|RUN|Total Stumpings in IPL|100.00|25000.00|90000000.00|90000000.00|0|1|0|1|12915762|100|18|100|16|0|0|0|0|0|0|0|0|1|0|0|1|0|0|1|1|1|5|1|2 (Matches Played :- 9 )|1|1743340770",
      "9.312915761|1686868|168686828127348|28127348|FANCY|F|RUN|Total Run Out in IPL|100.00|25000.00|90000000.00|90000000.00|0|1|0|1|12915761|100|60|100|55|0|0|0|0|0|0|0|0|1|0|0|1|0|0|1|1|1|5|1|8 Run Out (Matches Played :- 9 )|1|1743340770",
      "9.312915763|1686869|168686928127348|28127348|FANCY|F|RUN|Total Duck Outs in IPL|100.00|25000.00|90000000.00|90000000.00|0|1|0|1|12915763|100|98|100|92|0|0|0|0|0|0|0|0|1|0|0|1|0|0|1|1|1|5|1|11 (Matches Played :- 9 )|1|1743340770",
      "9.312915764|1686870|168687028127348|28127348|FANCY|F|RUN|Total 50 Plus Pships in IPL|100.00|25000.00|90000000.00|90000000.00|0|1|0|1|12915764|100|185|100|176|0|0|0|0|0|0|0|0|1|0|0|1|0|0|1|1|1|5|1|23 (Matches Played :- 9 )|1|1743340770",
      "9.312915765|1686871|168687128127348|28127348|FANCY|F|RUN|Total Highest Scoring Over Runs in IPL|100.00|25000.00|90000000.00|90000000.00|0|1|0|1|12915765|100|1595|100|1560|0|0|0|0|0|0|0|0|1|0|0|1|0|0|1|1|1|6|1|191 (Matches Played :- 9 )|1|1743340770",
      "9.312915766|1686872|168687228127348|28127348|FANCY|F|RUN|Total Hatricks of IPL|100.00|25000.00|90000000.00|90000000.00|0|1|0|1|12915766|55|1|75|1|0|0|0|0|0|0|0|0|1|0|0|1|0|0|1|1|1|6|1|0 (Matches Played :- 9 )|1|1743340770",
      "9.312915767|1686873|168687328127348|28127348|FANCY|F|RUN|Total Tie Matches of IPL|100.00|25000.00|90000000.00|90000000.00|0|1|0|1|12915767|55|1|75|1|0|0|0|0|0|0|0|0|1|0|0|1|0|0|1|1|1|6|1|0 (Matches Played :- 9 )|1|1743340770",
      "9.312928762|1696091|169609128127348|28127348|FANCY|F|RUN|Highest 4s in IndIvidual Match of IPL 2|100.00|25000.00|90000000.00|90000000.00|0|1|0|1|12928762|100|49|100|45|0|0|0|0|0|0|0|0|1|0|0|1|0|0|1|1|1|7|1|37 Fours (5th match)|1|1743340770",
      "9.312916618|1687467|168746728127348|28127348|FANCY|F|RUN|Highest Match 1st Over Run of IPL|100.00|25000.00|90000000.00|90000000.00|0|1|0|1|12916618|80|19|120|19|0|0|0|0|0|0|0|0|1|0|0|1|0|0|1|1|1|7|1|10 Runs(SRH)(2nd Match )|1|1743340770",
      "9.312915773|1686882|168688228127348|28127348|FANCY|F|RUN|Highest 50s in individual Match of IPL|100.00|25000.00|90000000.00|90000000.00|0|1|0|1|12915773|100|6|100|5|0|0|0|0|0|0|0|0|1|0|0|1|0|0|1|1|1|7|1|3 fifties (1ST /2ND / 4TH & 5TH  MATCH)|1|1743340770",
      "9.312915772|1686878|168687828127348|28127348|FANCY|F|RUN|Highest 30s in individual Match of IPL|100.00|25000.00|90000000.00|90000000.00|0|1|0|1|12915772|100|7|100|6|0|0|0|0|0|0|0|0|1|0|0|1|0|0|1|1|1|7|1|4 thirties (2nd & 5th & 8th match)|1|1743340770",
      "9.312915771|1686877|168687728127348|28127348|FANCY|F|RUN|Highest 6s in individual Match of IPL|100.00|25000.00|90000000.00|90000000.00|0|1|0|1|12915771|100|38|100|35|0|0|0|0|0|0|0|0|1|0|0|1|0|0|1|1|1|7|1|32 Sixes (5th Match)|1|1743340770",
      "9.312915777|1686883|168688328127348|28127348|FANCY|F|RUN|Highest Wickets in individual Match of IPL|100.00|25000.00|90000000.00|90000000.00|0|1|0|1|12915777|100|20|100|19|0|0|0|0|0|0|0|0|1|0|0|1|0|0|1|1|1|8|1|17 Wickets (4th Match)|1|1743340770",
      "9.312915778|1686884|168688428127348|28127348|FANCY|F|RUN|Highest Caught Outs in individual Match of IPL|100.00|25000.00|90000000.00|90000000.00|0|1|0|1|12915778|100|17|100|15|0|0|0|0|0|0|0|0|1|0|0|1|0|0|1|1|1|8|1|12 (2nd & 4th Match)|1|1743340770",
      "9.312915779|1686885|168688528127348|28127348|FANCY|F|RUN|Highest Bowled in individual Match of IPL|100.00|25000.00|90000000.00|90000000.00|0|1|0|1|12915779|100|7|100|6|0|0|0|0|0|0|0|0|1|0|0|1|0|0|1|1|1|8|1|4 Bowled (6th Match)|1|1743340770",
      "9.312915776|1686879|168687928127348|28127348|FANCY|F|RUN|Highest Double Digit Scorers in the Match of IPL|100.00|25000.00|90000000.00|90000000.00|0|1|0|1|12915776|100|14|100|13|0|0|0|0|0|0|0|0|1|0|0|1|0|0|1|1|1|8|1|12 Players (8th Match)|1|1743340770",
      "9.312915775|1686881|168688128127348|28127348|FANCY|F|RUN|Highest Single Digit Scorers in the Match of IPL|100.00|25000.00|90000000.00|90000000.00|0|1|0|1|12915775|100|11|100|10|0|0|0|0|0|0|0|0|1|0|0|1|0|0|1|1|1|8|1|7 Players  (3rd, 4th, 6th, 9th Match)|1|1743340770",
      "9.312915784|1686891|168689128127348|28127348|FANCY|F|RUN|Highest Wides in individual match of IPL|100.00|25000.00|90000000.00|90000000.00|0|1|0|1|12915784|100|27|100|25|0|0|0|0|0|0|0|0|1|0|0|1|0|0|1|1|1|9|1|21 (9th Match)|1|1743340770",
      "9.312915783|1686890|168689028127348|28127348|FANCY|F|RUN|Highest Duckouts in individual Match of IPL|100.00|25000.00|90000000.00|90000000.00|0|1|0|1|12915783|100|6|100|5|0|0|0|0|0|0|0|0|1|0|0|1|0|0|1|1|1|9|1|4 (4th Match)|1|1743340770",
      "9.312915782|1686888|168688828127348|28127348|FANCY|F|RUN|Highest Stumpings in individual Match of IPL|100.00|25000.00|90000000.00|90000000.00|0|1|0|1|12915782|100|3|100|2|0|0|0|0|0|0|0|0|1|0|0|1|0|0|1|1|1|9|1|1 (3rd & 8th Match)|1|1743340770",
      "9.312915781|1686887|168688728127348|28127348|FANCY|F|RUN|Highest Runout in individual Match of IPL|100.00|25000.00|90000000.00|90000000.00|0|1|0|1|12915781|100|5|100|4|0|0|0|0|0|0|0|0|1|0|0|1|0|0|1|1|1|9|1|2 ( 4th MATCH & 9th Match  )|1|1743340770",
      "9.312915780|1686886|168688628127348|28127348|FANCY|F|RUN|Highest LBW in individual Match of IPL|100.00|25000.00|90000000.00|90000000.00|0|1|0|1|12915780|100|5|100|4|0|0|0|0|0|0|0|0|1|0|0|1|0|0|1|1|1|9|1|2 (3rd Match)|1|1743340770",
      "9.312928763|1696092|169609228127348|28127348|FANCY|F|RUN|Most Runs Given by Bowler in the Match of IPL 2|100.00|25000.00|90000000.00|90000000.00|0|1|0|1|12928763|100|73|100|68|0|0|0|0|0|0|0|0|1|0|0|1|0|0|1|1|1|10|1|54 Runs (M.SIRAJ)  (5TH Match)|1|1743340770",
      "9.312916314|1687309|168730928127348|28127348|FANCY|F|RUN|Most 6's by individual batsman in a Match of IPL|100.00|25000.00|90000000.00|90000000.00|0|1|0|1|12916314|100|12|100|10|0|0|0|0|0|0|0|0|1|0|0|1|0|0|1|1|1|10|1|9 Sixes Shreyas Iyer (PBKS)(5th Match)|1|1743340770",
      "9.312916313|1687308|168730828127348|28127348|FANCY|F|RUN|Most 4's by individual batsman in a Match of IPL|100.00|25000.00|90000000.00|90000000.00|0|1|0|1|12916313|100|16|100|14|0|0|0|0|0|0|0|0|1|0|0|1|0|0|1|1|1|10|1|11 Fours (Ishan Kishan(SRH) 2nd Match)|1|1743340770",
      "9.312916312|1687307|168730728127348|28127348|FANCY|F|RUN|Most 50s by Individual Batsman of IPL|100.00|25000.00|90000000.00|90000000.00|0|1|0|1|12916312|100|7|100|6|0|0|0|0|0|0|0|0|1|0|0|1|0|0|1|1|1|10|1|2 Fifties ( Matches Player : 2)|1|1743340770",
      "9.312916311|1687306|168730628127348|28127348|FANCY|F|RUN|Most 4s hit by Individual Batsman of IPL|100.00|25000.00|90000000.00|90000000.00|0|1|0|1|12916311|100|73|100|67|0|0|0|0|0|0|0|0|1|0|0|1|0|0|1|1|1|10|1|14 Fours Travis Head (SRH) & Phil Salt (RCB) (2 Match)|1|1743340770",
      "9.312915788|1686895|168689528127348|28127348|FANCY|F|RUN|Most Balls Faced By a Batsman in the Match of IPL|100.00|25000.00|90000000.00|90000000.00|0|1|0|1|12915788|100|70|100|66|0|0|0|0|0|0|0|0|1|0|0|1|0|0|1|1|1|10|1|61 Balls (Quinton De kock (KKr) (6th Match)|1|1743340770",
      "9.312915787|1686894|168689428127348|28127348|FANCY|F|RUN|Most 6s hit by Individual Batsman of IPL|100.00|25000.00|90000000.00|90000000.00|0|1|0|1|12915787|100|47|100|41|0|0|0|0|0|0|0|0|1|0|0|1|0|0|1|1|1|10|1|13 Sixes Nicholas Pooran (LSG) (2 Match)|1|1743340770",
      "9.312915786|1686893|168689328127348|28127348|FANCY|F|RUN|Highest Scoring Over Runs in IPL|100.00|25000.00|90000000.00|90000000.00|0|1|0|1|12915786|100|32|100|31|0|0|0|0|0|0|0|0|1|0|0|1|0|0|1|1|1|10|1|28 Runs (4th Match)|1|1743340770",
      "9.312915785|1686892|168689228127348|28127348|FANCY|F|RUN|Highest Extras in individual match of IPL|100.00|25000.00|90000000.00|90000000.00|0|1|0|1|12915785|100|38|100|36|0|0|0|0|0|0|0|0|1|0|0|1|0|0|1|1|1|10|1|31 (2nd Match)|1|1743340770",
      "9.312915794|1686901|168690128127348|28127348|FANCY|F|RUN|Most 6s in an Inning of IPL|100.00|25000.00|90000000.00|90000000.00|0|1|0|1|12915794|100|24|100|21|0|0|0|0|0|0|0|0|1|0|0|1|0|0|1|1|1|11|1|18 Sixes (RR)(2nd Match)|1|1743340770",
      "9.312915792|1686899|168689928127348|28127348|FANCY|F|RUN|Most Extras in an Inning of IPL|100.00|25000.00|90000000.00|90000000.00|0|1|0|1|12915792|100|25|100|23|0|0|0|0|0|0|0|0|1|0|0|1|0|0|1|1|1|11|1|18 Extras (SRH)(2nd Match)|1|1743340770",
      "9.312915791|1686898|168689828127348|28127348|FANCY|F|RUN|Most No balls in an Inning of IPL|100.00|25000.00|90000000.00|90000000.00|0|1|0|1|12915791|100|5|100|4|0|0|0|0|0|0|0|0|1|0|0|1|0|0|1|1|1|11|1|3 (2nd Match)|1|1743340770",
      "9.312915790|1686897|168689728127348|28127348|FANCY|F|RUN|Most Wide in an Inning of IPL|100.00|25000.00|90000000.00|90000000.00|0|1|0|1|12915790|100|19|100|17|0|0|0|0|0|0|0|0|1|0|0|1|0|0|1|1|1|11|1|14 Wides (9th Match)|1|1743340770",
      "9.312915795|1686902|168690228127348|28127348|FANCY|F|RUN|Most 30s in an Inning of IPL|100.00|25000.00|90000000.00|90000000.00|0|1|0|1|12915795|100|5|100|4|0|0|0|0|0|0|0|0|1|0|0|1|0|0|1|1|1|12|1|3 Thirties (7th Match )|1|1743340770",
      "9.312915796|1686903|168690328127348|28127348|FANCY|F|RUN|Most 50s in an Inning of IPL|100.00|25000.00|90000000.00|90000000.00|0|1|0|1|12915796|100|4|100|3|0|0|0|0|0|0|0|0|1|0|0|1|0|0|1|1|1|12|1|2 Fifties(RCB)(1st Match)|1|1743340770",
      "9.312915798|1686905|168690528127348|28127348|FANCY|F|RUN|Most Caught Out in an Inning of IPL|100.00|25000.00|90000000.00|90000000.00|0|1|0|1|12915798|100|10|100|9|0|0|0|0|0|0|0|0|1|0|0|1|0|0|1|1|1|12|1|7 Caught Out (DC) (4th Match)|1|1743340770",
      "9.312915800|1686907|168690728127348|28127348|FANCY|F|RUN|Most LBW in an Inning of IPL|100.00|25000.00|90000000.00|90000000.00|0|1|0|1|12915800|100|4|100|3|0|0|0|0|0|0|0|0|1|0|0|1|0|0|1|1|1|13|1|2 (3rd Match)|1|1743340770",
      "9.312915801|1686908|168690828127348|28127348|FANCY|F|RUN|Most Runout in an Inning of IPL|100.00|25000.00|90000000.00|90000000.00|0|1|0|1|12915801|75|3|120|3|0|0|0|0|0|0|0|0|1|0|0|1|0|0|1|1|1|13|1|2 Run Out  (9th Match )|1|1743340770",
      "9.312915802|1686909|168690928127348|28127348|FANCY|F|RUN|Most Duckout in an Inning of IPL|100.00|25000.00|90000000.00|90000000.00|0|1|0|1|12915802|100|5|100|4|0|0|0|0|0|0|0|0|1|0|0|1|0|0|1|1|1|13|1|3 (4th Match)|1|1743340770",
      //unknown
      "1.230630840||OPEN|0||807082.86|6532817092|1743340770|71386514|ACTIVE|5.7|694.94|5.6|2007.97|5.5|3824.46|5.9|1488.07|6|600.8|6.2|167.31|7671295|ACTIVE|7.8|465.2|7.6|498|7.4|163.26|8|868.13|8.4|92.84|8.6|32.29|2954263|ACTIVE|8|100|7.8|193.92|7.6|39|8.2|75.4|8.4|85.02|8.6|1486.65|38528100|ACTIVE|9|139.67|8.8|940.92|8.6|200.54|9.2|1383.41|9.4|1156.39|9.8|50|22121561|ACTIVE|7.6|222.26|7.4|362.69|7.2|113.77|8|3194.77|8.4|121.65|8.6|648.76|2954281|ACTIVE|9.6|305.52|9.4|192.66|9.2|117|10|189.27|10.5|51.62|11|40.2|42821394|ACTIVE|12.5|100|12|165.13|11.5|89.14|13|222.78|14|75|27|10|2954260|ACTIVE|13|515.01|12.5|511.8|12|100.41|13.5|261.96|14|528.13|14.5|288.33|42821393|ACTIVE|14.5|213.29|14|120.11|13.5|57.83|15|143.55|15.5|308.52|16|913.06|2954266|ACTIVE|38|15.72|36|99.62|34|21.06|40|7.05|42|30.14|44|7.15"
    ];
    parseAndLoadData(rawData);
  }

  void loadDummyData() {
    questions.value = [
      Question(
        title: 'BOOKMAKER (INDIAN PREMIER LEAGUE CUP WINNER)',
        minBet: 100000,
        maxBet: 250000,
        backHeader: 'BACK',
        layHeader: 'LAY',
        options: [
          QuestionOption(
            teamName: 'Mumbai Indians',
            backBet:
                const BetCardModel(odds: '710', stake: '50k', isBack: true),
            layBet:
                const BetCardModel(odds: '910', stake: '50k', isBack: false),
          ),
          QuestionOption(
            teamName: 'Sunrisers Hyderabad',
            backBet: const BetCardModel(
                odds: '440', stake: '50k', isBack: true, isSuspended: true),
            layBet: const BetCardModel(
                odds: '490', stake: '50k', isBack: false, isSuspended: true),
          ),
          QuestionOption(
            teamName: 'Chennai Super Kings',
            backBet:
                const BetCardModel(odds: '660', stake: '50k', isBack: true),
            layBet:
                const BetCardModel(odds: '760', stake: '50k', isBack: false),
          ),
          QuestionOption(
            teamName: 'Kolkata Knight Riders',
            backBet:
                const BetCardModel(odds: '1180', stake: '50k', isBack: true),
            layBet:
                const BetCardModel(odds: '1480', stake: '50k', isBack: false),
          ),
          QuestionOption(
            teamName: 'Gujarat Titans',
            backBet:
                const BetCardModel(odds: '1020', stake: '50k', isBack: true),
            layBet:
                const BetCardModel(odds: '1320', stake: '50k', isBack: false),
          ),
          QuestionOption(
            teamName: 'Royal Challengers Bengaluru',
            backBet:
                const BetCardModel(odds: '430', stake: '50k', isBack: true),
            layBet:
                const BetCardModel(odds: '480', stake: '50k', isBack: false),
          ),
          QuestionOption(
            teamName: 'Delhi Capitals',
            backBet: const BetCardModel(
                odds: '1200', stake: '50k', isBack: true, isSuspended: true),
            layBet: const BetCardModel(
                odds: '1500', stake: '50k', isBack: false, isSuspended: true),
          ),
          QuestionOption(
            teamName: 'Lucknow Super Giants',
            backBet:
                const BetCardModel(odds: '1270', stake: '50k', isBack: true),
            layBet:
                const BetCardModel(odds: '1570', stake: '50k', isBack: false),
          ),
          QuestionOption(
            teamName: 'Punjab Kings',
            backBet:
                const BetCardModel(odds: '720', stake: '50k', isBack: true),
            layBet:
                const BetCardModel(odds: '820', stake: '50k', isBack: false),
          ),
          QuestionOption(
            teamName: 'Rajasthan Royals',
            backBet:
                const BetCardModel(odds: '2000', stake: '50k', isBack: true),
            layBet: const BetCardModel(odds: '0', stake: '0.0', isBack: false),
          ),
        ],
      ),
      Question(
        title: 'FANCY',
        minBet: 100000,
        maxBet: 250000,
        backHeader: 'NO',
        layHeader: 'YES',
        options: [
          QuestionOption(
            teamName: 'Lowest Inning Runs In IPL',
            showStarLeading: true,
            subtitle: 'Min: 100 | Max: 25k',
            slidingText: '11.5 Runs (MI) (6th Match)',
            backBet: const BetCardModel(
                odds: '99', stake: '100', isBack: true, isSuspended: true),
            layBet: const BetCardModel(
                odds: '104', stake: '100', isBack: false, isSuspended: true),
          ),
          QuestionOption(
            teamName: 'Highest Partnership Runs In IPL',
            showStarLeading: true,
            slidingText: '11.5 Runs | M Marsh & N Pooran | LSG (7th Match)',
            backBet: const BetCardModel(
                odds: '176', stake: '100', isBack: true, isSuspended: true),
            layBet: const BetCardModel(
                odds: '184', stake: '100', isBack: false, isSuspended: true),
          ),
          QuestionOption(
            teamName: 'Highest Inning Runs In IPL2',
            showStarLeading: true,
            subtitle: 'Min: 100 | Max: 25k',
            slidingText: '24.5 Runs | PBKS (5th Match)',
            backBet: const BetCardModel(
                odds: '266', stake: '100', isBack: true, isSuspended: true),
            layBet: const BetCardModel(
                odds: '276', stake: '100', isBack: false, isSuspended: true),
          ),
          QuestionOption(
            teamName: 'Tournament Topbatsman Runs In IPL',
            showStarLeading: true,
            slidingText: '126 Runs Shikhar Dhawan (2nd Match)',
            backBet: const BetCardModel(
                odds: '130', stake: '100', isBack: true, isSuspended: true),
            layBet: const BetCardModel(
                odds: '135', stake: '100', isBack: false, isSuspended: true),
          ),
          QuestionOption(
            teamName: 'Highest Run Scorer Runs (Orange Cap)',
            showStarLeading: true,
            slidingText: '145 runs Nicholas Pooran (23 Match)',
            backBet: const BetCardModel(
                odds: '775', stake: '100', isBack: true, isSuspended: true),
            layBet: const BetCardModel(
                odds: '810', stake: '100', isBack: false, isSuspended: true),
          ),
          QuestionOption(
            teamName: 'Highest Wicket Taker (Purple Cap)',
            showStarLeading: true,
            slidingText: '7 Wicket Noor Ahmad (2 Match)',
            backBet: const BetCardModel(
                odds: '27', stake: '100', isBack: true, isSuspended: true),
            layBet: const BetCardModel(
                odds: '29', stake: '100', isBack: false, isSuspended: true),
          ),
          QuestionOption(
            teamName: 'How Many Time 5 Or More Wickets Taken By Bowlers',
            showStarLeading: true,
            backBet: const BetCardModel(
                odds: '3', stake: '100', isBack: true, isSuspended: true),
            layBet: const BetCardModel(
                odds: '4', stake: '100', isBack: false, isSuspended: true),
          ),
          QuestionOption(
            teamName: 'Fastest 50 Of IPL',
            showStarLeading: true,
            slidingText: '15 balls Nicholas Pooran LSG (7th Match)',
            backBet: const BetCardModel(
                odds: '15', stake: '100', isBack: true, isSuspended: true),
            layBet: const BetCardModel(
                odds: '17', stake: '100', isBack: false, isSuspended: true),
          ),
          QuestionOption(
            teamName: 'Total 4`S In IPL',
            showStarLeading: true,
            slidingText: '285 Four`s (Matches Played - 9)',
            backBet: const BetCardModel(
                odds: '2250', stake: '100', isBack: true, isSuspended: true),
            layBet: const BetCardModel(
                odds: '2280', stake: '100', isBack: false, isSuspended: true),
          ),
          QuestionOption(
            teamName: 'Fastest 100 Of IPL',
            showStarLeading: true,
            slidingText: '43 balls Shikhar Dhawan (PBKS) (2nd Match)',
            backBet: const BetCardModel(
                odds: '42', stake: '100', isBack: true, isSuspended: true),
            layBet: const BetCardModel(
                odds: '44', stake: '100', isBack: false, isSuspended: true),
          ),
        ],
      ),
      Question(
        title: 'WINNER',
        minBet: 100000,
        maxBet: 250000,
        backHeader: 'BACK',
        layHeader: 'LAY',
        options: [
          QuestionOption(
            teamName: 'Mumbai Indians',
            backBet:
                const BetCardModel(odds: '9.8', stake: '100.52', isBack: true),
            layBet:
                const BetCardModel(odds: '10', stake: '100.52', isBack: false),
          ),
          QuestionOption(
            teamName: 'Sunrisers Hyderabad',
            backBet:
                const BetCardModel(odds: '7.4', stake: '139.0', isBack: true),
            layBet:
                const BetCardModel(odds: '7.8', stake: '21.02', isBack: false),
          ),
          QuestionOption(
            teamName: 'Chennai Super Kings',
            backBet:
                const BetCardModel(odds: '8', stake: '141.45', isBack: true),
            layBet:
                const BetCardModel(odds: '8.2', stake: '172.93', isBack: false),
          ),
          QuestionOption(
            teamName: 'Kolkata Knight Riders',
            backBet:
                const BetCardModel(odds: '13', stake: '203.35', isBack: true),
            layBet: const BetCardModel(
                odds: '13.5', stake: '172.93', isBack: false),
          ),
          QuestionOption(
            teamName: 'Gujarat Titans',
            backBet:
                const BetCardModel(odds: '12', stake: '192.49', isBack: true),
            layBet:
                const BetCardModel(odds: '12.5', stake: '1.02', isBack: false),
          ),
          QuestionOption(
            teamName: 'Royal Challengers Bengaluru',
            backBet:
                const BetCardModel(odds: '5.8', stake: '11.45', isBack: true),
            layBet:
                const BetCardModel(odds: '5.9', stake: '1.02', isBack: false),
          ),
          QuestionOption(
            teamName: 'Delhi Capitals',
            backBet:
                const BetCardModel(odds: '8.2', stake: '11.45', isBack: true),
            layBet:
                const BetCardModel(odds: '8.4', stake: '1.02', isBack: false),
          ),
          QuestionOption(
            teamName: 'Lucknow Super Giants',
            backBet:
                const BetCardModel(odds: '15', stake: '11.34', isBack: true),
            layBet:
                const BetCardModel(odds: '15.5', stake: '21.64', isBack: false),
          ),
          QuestionOption(
            teamName: 'Punjab Kings',
            backBet:
                const BetCardModel(odds: '9', stake: '11.45', isBack: true),
            layBet:
                const BetCardModel(odds: '9.2', stake: '1.02', isBack: false),
          ),
          QuestionOption(
            teamName: 'Rajasthan Royals',
            backBet:
                const BetCardModel(odds: '36', stake: '100.65', isBack: true),
            layBet:
                const BetCardModel(odds: '38', stake: '1.02', isBack: false),
          ),
        ],
      ),
    ];
  }
}

class CustomBetBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut(() => CustomBetController());
  }
}
