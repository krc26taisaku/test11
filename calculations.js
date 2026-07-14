
(()=>{
  const round=(value,digits=2)=>{
    const p=10**digits;
    return Math.round((Number(value)+Number.EPSILON)*p)/p;
  };

  const percent=value=>round(value*100,1);
  const money=value=>Math.round(value);
  const integer=value=>Math.round(value);

  function uniqueChoices(correct,wrongValues,formatter){
    const result=[];
    const add=value=>{
      const label=formatter(value);
      if(!result.some(item=>item.label===label))result.push({value,label});
    };
    add(correct);
    wrongValues.forEach(add);

    let offset=1;
    while(result.length<4){
      add(Number(correct)+offset);
      offset++;
    }
    return result.slice(0,4);
  }

  function makeQuestion(config){
    const correct=config.solve(config.values);
    const wrong=config.mistakes(config.values,correct);
    const choices=uniqueChoices(correct,wrong,config.formatAnswer);

    const correctLabel=config.formatAnswer(correct);
    const correctCount=choices.filter(x=>x.label===correctLabel).length;
    if(correctCount!==1)throw new Error(`${config.id}: 正解が選択肢内で一意ではありません`);
    if(choices.length!==4)throw new Error(`${config.id}: 選択肢が4つありません`);

    const steps=config.steps(config.values,correct);
    if(!steps.length)throw new Error(`${config.id}: 途中式がありません`);

    return {
      id:config.id,
      category:config.category,
      topic:config.topic,
      question:config.question(config.values),
      values:config.values,
      answer:correct,
      answerLabel:correctLabel,
      choices,
      formula:config.formula,
      steps,
      explanation:config.explanation(config.values,correct),
      unit:config.unit||''
    };
  }

  const q=[];

  // 損益分岐点
  q.push(makeQuestion({
    id:'CAL-BEP-001',category:'ストラテジ系',topic:'損益分岐点',
    values:{fixed:2400000,variableRate:0.4},
    question:v=>`固定費が${v.fixed.toLocaleString()}円、変動費率が${v.variableRate*100}%のとき、損益分岐点売上高はいくらか。`,
    solve:v=>money(v.fixed/(1-v.variableRate)),
    mistakes:(v,c)=>[
      money(v.fixed/v.variableRate),
      money(v.fixed*(1-v.variableRate)),
      money(v.fixed/(1+v.variableRate))
    ],
    formatAnswer:v=>`${money(v).toLocaleString()}円`,
    formula:'損益分岐点売上高 ＝ 固定費 ÷（1－変動費率）',
    steps:(v,c)=>[
      `限界利益率 ＝ 1－${v.variableRate} ＝ ${round(1-v.variableRate,2)}`,
      `${v.fixed.toLocaleString()} ÷ ${round(1-v.variableRate,2)} ＝ ${c.toLocaleString()}`
    ],
    explanation:(v,c)=>`売上高のうち固定費の回収に使える割合は${(1-v.variableRate)*100}%です。固定費をその割合で割ると損益分岐点売上高になります。`
  }));

  q.push(makeQuestion({
    id:'CAL-BEP-002',category:'ストラテジ系',topic:'損益分岐点',
    values:{sales:8000000,variable:3200000,fixed:2700000},
    question:v=>`売上高${v.sales.toLocaleString()}円、変動費${v.variable.toLocaleString()}円、固定費${v.fixed.toLocaleString()}円のとき、利益はいくらか。`,
    solve:v=>money(v.sales-v.variable-v.fixed),
    mistakes:(v,c)=>[
      money(v.sales-v.variable+v.fixed),
      money(v.sales-v.fixed),
      money(v.sales-(v.variable/v.sales)-v.fixed)
    ],
    formatAnswer:v=>`${money(v).toLocaleString()}円`,
    formula:'利益 ＝ 売上高－変動費－固定費',
    steps:(v,c)=>[
      `${v.sales.toLocaleString()}－${v.variable.toLocaleString()}－${v.fixed.toLocaleString()}`,
      `＝ ${c.toLocaleString()}`
    ],
    explanation:(v,c)=>'売上高から、売上に応じて増減する変動費と、一定額かかる固定費の両方を引きます。'
  }));

  q.push(makeQuestion({
    id:'CAL-BEP-003',category:'ストラテジ系',topic:'損益分岐点',
    values:{price:5000,variablePer:3000,fixed:1600000},
    question:v=>`商品1個の販売価格が${v.price.toLocaleString()}円、1個当たり変動費が${v.variablePer.toLocaleString()}円、固定費が${v.fixed.toLocaleString()}円である。損益分岐点販売数量は何個か。`,
    solve:v=>integer(v.fixed/(v.price-v.variablePer)),
    mistakes:(v,c)=>[
      integer(v.fixed/v.price),
      integer(v.fixed/v.variablePer),
      integer(v.fixed/(v.price+v.variablePer))
    ],
    formatAnswer:v=>`${integer(v).toLocaleString()}個`,
    formula:'損益分岐点数量 ＝ 固定費 ÷（販売単価－1個当たり変動費）',
    steps:(v,c)=>[
      `1個当たり限界利益 ＝ ${v.price.toLocaleString()}－${v.variablePer.toLocaleString()} ＝ ${(v.price-v.variablePer).toLocaleString()}円`,
      `${v.fixed.toLocaleString()} ÷ ${(v.price-v.variablePer).toLocaleString()} ＝ ${c.toLocaleString()}個`
    ],
    explanation:(v,c)=>'商品1個を売るごとに固定費の回収へ回せる金額を求め、その金額で固定費を割ります。'
  }));

  // 工数
  q.push(makeQuestion({
    id:'CAL-WORK-001',category:'マネジメント系',topic:'工数',
    values:{people:8,days:15,donePeople:8,doneDays:5,newDays:5},
    question:v=>`${v.people}人で${v.days}日かかる作業を開始し、${v.donePeople}人で${v.doneDays}日作業した。残りを${v.newDays}日で終えるには、以後何人必要か。`,
    solve:v=>integer((v.people*v.days-v.donePeople*v.doneDays)/v.newDays),
    mistakes:(v,c)=>[
      integer((v.people*v.days)/v.newDays),
      integer((v.people*v.days-v.donePeople*v.doneDays)/(v.newDays+v.doneDays)),
      integer(v.people*v.days-v.donePeople*v.doneDays)
    ],
    formatAnswer:v=>`${integer(v)}人`,
    formula:'総工数 ＝ 人数×日数、必要人数 ＝ 残工数÷残日数',
    steps:(v,c)=>[
      `総工数 ＝ ${v.people}×${v.days} ＝ ${v.people*v.days}人日`,
      `完了工数 ＝ ${v.donePeople}×${v.doneDays} ＝ ${v.donePeople*v.doneDays}人日`,
      `残工数 ＝ ${v.people*v.days}－${v.donePeople*v.doneDays} ＝ ${v.people*v.days-v.donePeople*v.doneDays}人日`,
      `${v.people*v.days-v.donePeople*v.doneDays}÷${v.newDays} ＝ ${c}人`
    ],
    explanation:(v,c)=>'最初に作業全体を人日へ直し、完了分を引いてから残り日数で割ります。'
  }));

  q.push(makeQuestion({
    id:'CAL-WORK-002',category:'マネジメント系',topic:'工数',
    values:{people:12,days:20,productivity:1.25},
    question:v=>`${v.people}人で${v.days}日かかる作業がある。1人当たりの生産性が従来の${v.productivity}倍になった場合、同じ人数では何日かかるか。`,
    solve:v=>integer(v.days/v.productivity),
    mistakes:(v,c)=>[
      integer(v.days*v.productivity),
      integer(v.days/(v.productivity-1)),
      integer(v.days-v.productivity)
    ],
    formatAnswer:v=>`${integer(v)}日`,
    formula:'新しい所要日数 ＝ 従来の日数 ÷ 生産性の倍率',
    steps:(v,c)=>[
      `${v.days} ÷ ${v.productivity} ＝ ${c}`
    ],
    explanation:(v,c)=>'生産性が高くなるほど必要な時間は短くなるため、倍率を掛けるのではなく割ります。'
  }));

  q.push(makeQuestion({
    id:'CAL-WORK-003',category:'マネジメント系',topic:'工数',
    values:{months:6,people:5,hoursPerMonth:160},
    question:v=>`${v.people}人が${v.months}か月、1人当たり月${v.hoursPerMonth}時間作業する。総工数は何時間か。`,
    solve:v=>integer(v.months*v.people*v.hoursPerMonth),
    mistakes:(v,c)=>[
      integer(v.months*v.hoursPerMonth),
      integer(v.people*v.hoursPerMonth),
      integer(v.months*v.people+v.hoursPerMonth)
    ],
    formatAnswer:v=>`${integer(v).toLocaleString()}時間`,
    formula:'総工数 ＝ 月数×人数×1人当たり月間作業時間',
    steps:(v,c)=>[
      `${v.months}×${v.people}×${v.hoursPerMonth} ＝ ${c.toLocaleString()}`
    ],
    explanation:(v,c)=>'人月を時間へ換算するため、月数・人数・1人当たり時間をすべて掛けます。'
  }));

  // 確率・場合の数
  q.push(makeQuestion({
    id:'CAL-PROB-001',category:'ストラテジ系',topic:'確率',
    values:{total:10,hit:3},
    question:v=>`${v.total}本のくじに当たりが${v.hit}本ある。1本引くとき、当たる確率は何%か。`,
    solve:v=>percent(v.hit/v.total),
    mistakes:(v,c)=>[
      percent((v.total-v.hit)/v.total),
      round(v.hit/v.total,1),
      percent(v.hit/(v.total-v.hit))
    ],
    formatAnswer:v=>`${round(v,1)}%`,
    formula:'確率 ＝ 条件に合う数 ÷ 全体の数',
    steps:(v,c)=>[
      `${v.hit}÷${v.total} ＝ ${round(v.hit/v.total,2)}`,
      `${round(v.hit/v.total,2)}×100 ＝ ${c}%`
    ],
    explanation:(v,c)=>'小数で求めた確率を百分率にするため、最後に100を掛けます。'
  }));

  q.push(makeQuestion({
    id:'CAL-PROB-002',category:'ストラテジ系',topic:'確率',
    values:{total:8,hit:2},
    question:v=>`${v.total}本のくじに当たりが${v.hit}本ある。引いたくじを戻さずに2本続けて引くとき、2本とも当たる確率は何%か。`,
    solve:v=>percent((v.hit/v.total)*((v.hit-1)/(v.total-1))),
    mistakes:(v,c)=>[
      percent((v.hit/v.total)*(v.hit/v.total)),
      percent(v.hit/v.total),
      percent(((v.total-v.hit)/v.total)*((v.total-v.hit-1)/(v.total-1)))
    ],
    formatAnswer:v=>`${round(v,1)}%`,
    formula:'連続して起こる確率 ＝ 1回目の確率×2回目の確率',
    steps:(v,c)=>[
      `1回目 ＝ ${v.hit}/${v.total}`,
      `2回目 ＝ ${v.hit-1}/${v.total-1}`,
      `${v.hit}/${v.total}×${v.hit-1}/${v.total-1}×100 ＝ ${c}%`
    ],
    explanation:(v,c)=>'戻さないので、1回引いた後は当たり本数も全体本数も1本ずつ減ります。'
  }));

  q.push(makeQuestion({
    id:'CAL-COMB-001',category:'ストラテジ系',topic:'場合の数',
    values:{n:7,r:3},
    question:v=>`${v.n}人の中から順序を考えずに${v.r}人を選ぶ方法は何通りか。`,
    solve:v=>{
      let num=1,den=1;
      for(let i=0;i<v.r;i++){num*=v.n-i;den*=i+1}
      return integer(num/den);
    },
    mistakes:(v,c)=>[
      integer(v.n*(v.n-1)*(v.n-2)),
      integer(v.n**v.r),
      integer(v.n*v.r)
    ],
    formatAnswer:v=>`${integer(v)}通り`,
    formula:'組合せ nCr ＝ n! ÷｛r!（n－r）!｝',
    steps:(v,c)=>[
      `${v.n}C${v.r} ＝ ${v.n}×${v.n-1}×${v.n-2} ÷（${v.r}×${v.r-1}×1）`,
      `＝ ${c}通り`
    ],
    explanation:(v,c)=>'選ぶ順番を区別しないため、順列の数を選んだ人数の並べ方で割ります。'
  }));

  // 稼働率
  q.push(makeQuestion({
    id:'CAL-AVAIL-001',category:'テクノロジ系',topic:'稼働率',
    values:{mtbf:180,mttr:20},
    question:v=>`MTBFが${v.mtbf}時間、MTTRが${v.mttr}時間のシステムの稼働率は何%か。`,
    solve:v=>percent(v.mtbf/(v.mtbf+v.mttr)),
    mistakes:(v,c)=>[
      percent(v.mttr/(v.mtbf+v.mttr)),
      percent(v.mtbf/v.mttr),
      round(v.mtbf/(v.mtbf+v.mttr),1)
    ],
    formatAnswer:v=>`${round(v,1)}%`,
    formula:'稼働率 ＝ MTBF ÷（MTBF＋MTTR）',
    steps:(v,c)=>[
      `${v.mtbf}÷（${v.mtbf}＋${v.mttr}）`,
      `＝ ${v.mtbf}÷${v.mtbf+v.mttr} ＝ ${round(v.mtbf/(v.mtbf+v.mttr),3)}`,
      `＝ ${c}%`
    ],
    explanation:(v,c)=>'正常に動く平均時間を、正常時間と修理時間を合わせた全時間で割ります。'
  }));

  q.push(makeQuestion({
    id:'CAL-AVAIL-002',category:'テクノロジ系',topic:'稼働率',
    values:{a:0.9,b:0.8},
    question:v=>`稼働率${v.a*100}%の装置Aと、稼働率${v.b*100}%の装置Bを直列に接続した。全体の稼働率は何%か。`,
    solve:v=>percent(v.a*v.b),
    mistakes:(v,c)=>[
      percent(v.a+v.b-v.a*v.b),
      percent((v.a+v.b)/2),
      percent(v.a+v.b)
    ],
    formatAnswer:v=>`${round(v,1)}%`,
    formula:'直列システムの稼働率 ＝ 各装置の稼働率の積',
    steps:(v,c)=>[
      `${v.a}×${v.b} ＝ ${round(v.a*v.b,2)}`,
      `${round(v.a*v.b,2)}×100 ＝ ${c}%`
    ],
    explanation:(v,c)=>'直列では両方が同時に動作している必要があるため、稼働率を掛け合わせます。'
  }));

  q.push(makeQuestion({
    id:'CAL-AVAIL-003',category:'テクノロジ系',topic:'稼働率',
    values:{a:0.9,b:0.8},
    question:v=>`稼働率${v.a*100}%の装置Aと、稼働率${v.b*100}%の装置Bを並列に接続し、どちらか一方が動けばよい。全体の稼働率は何%か。`,
    solve:v=>percent(1-(1-v.a)*(1-v.b)),
    mistakes:(v,c)=>[
      percent(v.a*v.b),
      percent((v.a+v.b)/2),
      percent(v.a+v.b-v.a-v.b)
    ],
    formatAnswer:v=>`${round(v,1)}%`,
    formula:'並列システムの稼働率 ＝ 1－（両方が停止する確率）',
    steps:(v,c)=>[
      `A停止 ＝ 1－${v.a} ＝ ${round(1-v.a,1)}`,
      `B停止 ＝ 1－${v.b} ＝ ${round(1-v.b,1)}`,
      `1－（${round(1-v.a,1)}×${round(1-v.b,1)}）＝ ${round(c/100,2)}`,
      `＝ ${c}%`
    ],
    explanation:(v,c)=>'並列では両方が同時に停止したときだけ全体が止まるため、その確率を1から引きます。'
  }));

  // 投資回収・財務
  q.push(makeQuestion({
    id:'CAL-INVEST-001',category:'ストラテジ系',topic:'投資回収',
    values:{investment:12000000,annual:3000000},
    question:v=>`${v.investment.toLocaleString()}円を投資し、毎年${v.annual.toLocaleString()}円の効果が得られる。単純回収期間は何年か。`,
    solve:v=>round(v.investment/v.annual,1),
    mistakes:(v,c)=>[
      round(v.annual/v.investment,1),
      round(v.investment-v.annual,1),
      round(v.investment/(v.annual*12),1)
    ],
    formatAnswer:v=>`${round(v,1)}年`,
    formula:'回収期間 ＝ 投資額 ÷ 年間効果額',
    steps:(v,c)=>[
      `${v.investment.toLocaleString()}÷${v.annual.toLocaleString()} ＝ ${c}`
    ],
    explanation:(v,c)=>'毎年得られる効果額が何年分あれば投資額に届くかを計算します。'
  }));

  q.push(makeQuestion({
    id:'CAL-ROI-001',category:'ストラテジ系',topic:'投資回収',
    values:{profit:2500000,investment:10000000},
    question:v=>`投資額${v.investment.toLocaleString()}円に対して利益が${v.profit.toLocaleString()}円だった。ROIは何%か。`,
    solve:v=>percent(v.profit/v.investment),
    mistakes:(v,c)=>[
      percent(v.investment/v.profit),
      round(v.profit/v.investment,1),
      percent((v.profit-v.investment)/v.investment)
    ],
    formatAnswer:v=>`${round(v,1)}%`,
    formula:'ROI ＝ 利益 ÷ 投資額 ×100',
    steps:(v,c)=>[
      `${v.profit.toLocaleString()}÷${v.investment.toLocaleString()} ＝ ${round(v.profit/v.investment,2)}`,
      `${round(v.profit/v.investment,2)}×100 ＝ ${c}%`
    ],
    explanation:(v,c)=>'投資した金額に対して、利益がどの程度の割合になったかを表します。'
  }));

  // CPU・通信
  q.push(makeQuestion({
    id:'CAL-CPU-001',category:'テクノロジ系',topic:'CPU',
    values:{clockGHz:2.5,cpi:4},
    question:v=>`クロック周波数が${v.clockGHz}GHz、平均CPIが${v.cpi}のCPUは、1秒間に平均何億命令を実行できるか。`,
    solve:v=>round((v.clockGHz*10)/v.cpi,2),
    mistakes:(v,c)=>[
      round(v.clockGHz*10*v.cpi,2),
      round(v.clockGHz/v.cpi,2),
      round(v.cpi/(v.clockGHz*10),2)
    ],
    formatAnswer:v=>`${round(v,2)}億命令`,
    formula:'1秒当たり命令数 ＝ クロック周波数 ÷ 平均CPI',
    steps:(v,c)=>[
      `${v.clockGHz}GHz ＝ ${v.clockGHz*10}億クロック/秒`,
      `${v.clockGHz*10}÷${v.cpi} ＝ ${c}億命令/秒`
    ],
    explanation:(v,c)=>'1命令に平均何クロック必要かを示すCPIで、1秒当たりクロック数を割ります。'
  }));

  q.push(makeQuestion({
    id:'CAL-NET-001',category:'テクノロジ系',topic:'通信',
    values:{mb:120,mbps:40,efficiency:0.75},
    question:v=>`${v.mb}MBのファイルを、伝送速度${v.mbps}Mbps、伝送効率${v.efficiency*100}%の回線で送る。伝送時間は何秒か。1MB＝8Mbitとする。`,
    solve:v=>round((v.mb*8)/(v.mbps*v.efficiency),1),
    mistakes:(v,c)=>[
      round(v.mb/(v.mbps*v.efficiency),1),
      round((v.mb*8)/v.mbps,1),
      round((v.mb*8)*v.mbps*v.efficiency,1)
    ],
    formatAnswer:v=>`${round(v,1)}秒`,
    formula:'伝送時間 ＝ データ量（bit）÷ 実効伝送速度',
    steps:(v,c)=>[
      `データ量 ＝ ${v.mb}×8 ＝ ${v.mb*8}Mbit`,
      `実効速度 ＝ ${v.mbps}×${v.efficiency} ＝ ${v.mbps*v.efficiency}Mbps`,
      `${v.mb*8}÷${v.mbps*v.efficiency} ＝ ${c}秒`
    ],
    explanation:(v,c)=>'Byteをbitへ変換し、伝送効率を反映した実効速度で割ります。'
  }));

  q.push(makeQuestion({
    id:'CAL-STORAGE-001',category:'テクノロジ系',topic:'容量',
    values:{width:1920,height:1080,bits:24,frames:30,seconds:10},
    question:v=>`解像度${v.width}×${v.height}、1画素${v.bits}ビット、毎秒${v.frames}フレームの非圧縮動画を${v.seconds}秒記録する。データ量は約何MBか。1MB＝8,000,000ビットとする。`,
    solve:v=>round(v.width*v.height*v.bits*v.frames*v.seconds/8000000,1),
    mistakes:(v,c)=>[
      round(v.width*v.height*v.bits*v.seconds/8000000,1),
      round(v.width*v.height*v.frames*v.seconds/8000000,1),
      round(v.width*v.height*v.bits*v.frames*v.seconds/1000000,1)
    ],
    formatAnswer:v=>`${round(v,1)}MB`,
    formula:'データ量 ＝ 横×縦×色深度×フレーム数×時間 ÷ 8,000,000',
    steps:(v,c)=>[
      `${v.width}×${v.height}×${v.bits}×${v.frames}×${v.seconds}`,
      `＝ ${(v.width*v.height*v.bits*v.frames*v.seconds).toLocaleString()}ビット`,
      `÷8,000,000 ＝ ${c}MB`
    ],
    explanation:(v,c)=>'1画面のビット数に1秒当たりフレーム数と秒数を掛け、最後にMBへ換算します。'
  }));

  window.CALCULATION_QUESTIONS=q;
  window.CALCULATION_VALIDATION={
    total:q.length,
    valid:q.every(item=>
      item.choices.length===4 &&
      item.choices.filter(c=>c.label===item.answerLabel).length===1 &&
      item.steps.length>0
    )
  };

  if(!window.CALCULATION_VALIDATION.valid){
    throw new Error('計算問題データの検証に失敗しました');
  }
})();
