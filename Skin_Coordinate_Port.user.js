// ==UserScript==
// @name        Skin Coordinate Port
// @namespace        http://tampermonkey.net/
// @version        1.1
// @description        公式スキンをCSS編集用デザインのスキンに移植する
// @author        Ameba Blog User
// @match        https://ameblo.jp/*
// @match        https://blog.ameba.jp/ucs/skin/*
// @match        https://blog.ameba.jp/ucs/editcss/*
// @match        https://blog.ameba.jp/ucs/sidebar/*
// @icon        https://www.google.com/s2/favicons?sz=64&domain=ameba.jp
// @run-at        document-start
// @noframes
// @grant        none
// @updateURL        https://github.com/personwritep/Skin_Coordinate_Port/raw/main/Skin_Coordinate_Port.user.js
// @downloadURL        https://github.com/personwritep/Skin_Coordinate_Port/raw/main/Skin_Coordinate_Port.user.js
// ==/UserScript==


let ua=0; // Chromeの場合のフラグ
let agent=window.navigator.userAgent.toLowerCase();
if(agent.indexOf('firefox') > -1){ ua=1; } // Firefoxの場合のフラグ

let task=0; // メイン ON/OFF
let skin_code; // ブログスキンのコード名
let skincss; // ブログスキンのCSS
let b1_open=0; // スキンCSSの表示/非表示
let b2_open=0; // トップページ型式・カラムの設定パネル
let b3_open=0; // 移植の実行
let b4_open=0; // 復帰の実行
let redo_navi=0; // 再実行のコントロール
let get=0; // 元スキンコードの取得完了のフラグ
let type; // トップページ型式
let layout; // カラム設定 2～6

let target=document.querySelector('head');
let monitor=new MutationObserver(catch_key);
monitor.observe(target, { childList: true });

catch_key();

function catch_key(){
    if(check_user_css()==0 || check_user_css()==1){ // 実際のブログページが起動条件
        document.addEventListener("keydown", check_key);
        function check_key(event){
            let gate=-1;
            if(event.altKey==true){
                if(event.keyCode==117){
                    event.preventDefault(); gate=1; }} // ショートカット「Alt＋F6」

            if(gate==1){
                event.stopImmediatePropagation();
                event.preventDefault();

                main(); }} // ツールの実効関数
    }} // catch_key



function check_user_css(){
    let page_html=document.querySelector('html');
    if(!page_html.classList.contains('fixed')){
        return -1; } // プレビュー画面の場合の判定
    else{ // 実際のブログ画面の場合と判定
        skin_code=page_html.getAttribute('data-skin-code');
        if(skin_code){
            if(skin_code.includes('cssedit')){
                return 1; } // ページのスキンがCSS編集用デザインの判定
            else{
                return 0; }}}} // ページのスキンが通常の公式スキンの判定



function main(){
    if(task==0){
        task=1;
        panel1_disp();
        coordinate(); }
    else if(task==1){
        task=0;
        panel1_remove();
        panel2_remove();
        hide_css();
    }}



function panel1_disp(){
    let help_url='https://ameblo.jp/personwritep/entry-12817550826.html';
    let help_SVG=
        '<svg class="sci_help" height="24" width="24" viewBox="0 0 210 220">'+
        '<path d="M89 22C71 25 54 33 41 46C7 81 11 142 50 171C58 177 68 182 78 '+
        '185C90 188 103 189 115 187C126 185 137 181 146 175C155 169 163 162 169 '+
        '153C190 123 189 80 166 52C147 30 118 18 89 22z" style="fill: #eee;"></path>'+
        '<path d="M67 77C73 75 78 72 84 70C94 66 114 67 109 83C106 91 98 95 93 '+
        '101C86 109 83 116 83 126L111 126C112 114 122 108 129 100C137 90 141 76 '+
        '135 64C127 45 101 45 84 48C80 49 71 50 68 54C67 56 67 59 67 61L67 77M'+
        '85 143L85 166L110 166L110 143L85 143z" style="fill:#000;"></path>'+
        '</svg>';

    let panel=
        '<div id="panel1">'+
        '<a href="'+ help_url +'" rel="noopener noreferrer" target="_blank">'+
        help_SVG +'</a>'+
        '<input id="b1" type="submit" value="スキン情報">'+
        '<input id="b2" type="submit" value="トップページ型式・カラムの設定">'+
        '<input id="b3" type="submit" value=" 移植の実行 ">'+
        '<input id="b4" type="submit" value="予備　">'+
        '<input id="editor" type="submit" value="CSS編集画面">'+
        '<input id="change_skin" type="submit" value="デザインの変更">'+
        '<input id="sidebar" type="submit" value="メニュー配置">'+
        '<style>'+
        '#panel1 { position: fixed; bottom: 90px; left: calc(50% - 490px); '+
        'background: rgba(0, 95, 86, 0.8); border: 2px solid #fff; border-radius: 4px; '+
        'width: 980px; z-index: 10; padding: 15px 0 15px 20px; } ';

    if(ua==1){
        panel+='#panel1 { padding: 14px 0 14px 20px; } '; }

    panel+=
        '#panel1 input { font: normal 16px meiryo; color: #000; '+
        'margin-right: 15px; padding: 4px 6px 2px; } '+
        '.sci_help { margin: 0 15px -7px -8px; } '+
        '#b1, #b2, #b3, #b4 { outline: none; } '+
        '#b4 { width: 33px; visibility: hidden; } '+
        '#sidebar { margin: 0 !important; }'+
        '</style></div>';

    if(!document.querySelector('#panel1')){
        document.body.insertAdjacentHTML('beforeend', panel); }

} // panel1_disp()



function panel1_remove(){
    let panel1=document.querySelector('#panel1');
    if(panel1){
        panel1.remove(); }}



function panel2_disp(){
    let panel2=
        '<div id="panel2">'+
        '<label for="t0" id="t0_l">'+
        '<input id="t0" type="radio" name="blog_type" value="ur_std_pf_cssedit">'+
        '標準型</label>'+
        '<label for="t1" id="t1_l">'+
        '<input id="t1" type="radio" name="blog_type" value="ur_list_pf_cssedit">'+
        'リスト型</label>'+
        '<label for="t2" id="t2_l">'+
        '<input id="t2" type="radio" name="blog_type" value="ur_tile_pf_cssedit">'+
        'タイル型</label>'+
        '<span style="color: #fff">カラム: </span>'+
        '<label for="c2"><input id="c2" type="radio" name="column" value="2">'+
        '<i class="c_m">　</i><i class="c_tx">　</i></label>'+
        '<label for="c3"><input id="c3" type="radio" name="column" value="3">'+
        '<i class="c_tx">　</i><i class="c_m">　</i></label>'+
        '<label for="c4"><input id="c4" type="radio" name="column" value="4">'+
        '<i class="c_s">　</i><i class="c_tx">　</i><i class="c_m">　</i></label>'+
        '<label for="c5"><input id="c5" type="radio" name="column" value="5">'+
        '<i class="c_m">　</i><i class="c_tx">　</i><i class="c_s">　</i></label>'+
        '<label for="c6"><input id="c6" type="radio" name="column" value="6">'+
        '<i class="c_tx">　</i><i class="c_s">　</i><i class="c_m">　</i></label>'+

        '<style>'+
        '#panel2 { position: fixed; bottom: 160px; left: calc(50% - 490px); '+
        'width: 980px; padding: 14px 0 14px 20px; background: rgba(0, 95, 86, 0.8); '+
        'border: 2px solid #fff; border-radius: 4px; font: normal 16px meiryo; z-index: 10;} '+
        '#panel2 input { height: 16px; width: 16px; margin: 0 4px 0 0; vertical-align: -2px; } '+
        'input#c2, input#c3, input#c4, input#c5, input#c6 '+
        '{ margin-right: 10px; vertical-align: -3px; } '+

        '#panel2 label { display: inline-block; padding: 6px 12px 4px; margin-right: 10px; '+
        'border-radius: 2px; color: #000; height: 25px; } '+
        'label[for="t0"], label[for="t1"], label[for="t2"] { background: #d2edff; } '+
        'label[for="t2"] { margin-right: 20px !important; } '+
        'label[for="c2"], label[for="c3"], label[for="c4"], label[for="c5"], label[for="c6"] '+
        '{ background: #fff; } '+

        '#panel2 .c_s { display: inline-block; border: 1px solid #000; '+
        'background: #ff9da2; width: 10px; height: 22px; margin-right: -1px; } '+
        '#panel2 .c_m { display: inline-block; border: 1px solid #000; '+
        'background: #ff9da2; width: 16px; height: 22px; margin-right: -1px; } '+
        '#panel2 .c_tx { display: inline-block; border: 1px solid #000; '+
        'background: #fff; width: 28px; height: 22px; margin-right: -1px; }'+
        '</style></div>';

    if(!document.querySelector('#panel2')){
        document.body.insertAdjacentHTML('beforeend', panel2); }

} // panel2_disp()


function panel2_remove(){
    let panel2=document.querySelector('#panel2');
    if(panel2){
        panel2.remove(); }}



function manual_set_start(){
    let t0=document.querySelector('#t0');
    let t1=document.querySelector('#t1');
    let t2=document.querySelector('#t2');
    let t1_l=document.querySelector('#t1_l');
    let t2_l=document.querySelector('#t2_l');
    let c2=document.querySelector('#c2');
    let c3=document.querySelector('#c3');
    let c4=document.querySelector('#c4');
    let c5=document.querySelector('#c5');
    let c6=document.querySelector('#c6');

    let page_html=document.querySelector('html');

    if(skin_code.includes('wu_pf')){
        t0.checked=true;
        t1.disabled=true;
        t2.disabled=true;
        t1_l.style.opacity='0.4';
        t2_l.style.opacity='0.4'; }
    if(skin_code.includes('ur_std_pf')){
        t0.checked=true; }
    if(skin_code.includes('ur_list_pf')){
        t1.checked=true;
        t1_l.style.opacity='1'; }
    if(skin_code.includes('ur_tile_pf')){
        t2.checked=true;
        t2_l.style.opacity='1'; }

    if(page_html.classList.contains('columnA')){
        c2.checked=true; }
    if(page_html.classList.contains('columnB')){
        c3.checked=true; }
    if(page_html.classList.contains('columnC')){
        c4.checked=true; }
    if(page_html.classList.contains('columnD')){
        c5.checked=true; }
    if(page_html.classList.contains('columnE')){
        c6.checked=true; }}


function manual_set_get(){
    let t0=document.querySelector('#t0');
    let t1=document.querySelector('#t1');
    let t2=document.querySelector('#t2');
    let c2=document.querySelector('#c2');
    let c3=document.querySelector('#c3');
    let c4=document.querySelector('#c4');
    let c5=document.querySelector('#c5');
    let c6=document.querySelector('#c6');

    let page_html=document.querySelector('html');

    if(t0.checked==true){
        if(skin_code.includes('wu_pf')){
            type='wu_pf_cssedit'; }
        else{
            type=t0.value; }}
    if(t1.checked==true){
        type=t1.value; }
    if(t2.checked==true){
        type=t2.value; }

    if(c2.checked==true){
        layout=c2.value; }
    if(c3.checked==true){
        layout=c3.value; }
    if(c4.checked==true){
        layout=c4.value; }
    if(c5.checked==true){
        layout=c5.value; }
    if(c6.checked==true){
        layout=c6.value; }}



function coordinate(){
    let b1=document.querySelector('#b1');
    let b2=document.querySelector('#b2');
    let b3=document.querySelector('#b3');
    let b4=document.querySelector('#b4');
    let editor=document.querySelector('#editor');
    let change_skin=document.querySelector('#change_skin');
    let sidebar=document.querySelector('#sidebar');

    task_navi_reset(); // CSSコードを取得するまで、b2・b3は押せない

    b1.onclick=function(){
        if(b1_open==0){
            b1_open=1;
            b1.style.boxShadow='0 0 0 2px #2196f3, 0 0 0 4px #fff';
            open_css();
            if(check_user_css()==0){
                b2.disabled=false; }}
        else{
            b1_open=0;
            b1.style.boxShadow='none';
            hide_css();
            if(b2_open==1){ // b1が閉じた場合は、panel2も閉じる
                b2_open=0;
                b2.style.boxShadow='none';
                panel2_remove(); }
            if(b3_open==1){
                b3_open=0;
                b3.style.boxShadow='none'; }
            task_navi_reset(); }}


    b2.onclick=function(){
        if(b2_open==0){
            b2_open=1;
            b2.style.boxShadow='0 0 0 2px #2196f3, 0 0 0 4px #fff';
            panel2_disp();
            manual_set_start();
            b3.disabled=false; }
        else{
            b2_open=0;
            b2.style.boxShadow='none';
            panel2_remove();
            b3.disabled=true; }}


    b3.onclick=function(){
        if(b3_open==0 || b3_open==1){
            b3_open=1;
            b3.style.boxShadow='0 0 0 2px #2196f3, 0 0 0 4px #fff';
            if(redo_navi==0){
                redo_navi=1; // 初回移植処理の実効済
                rewrite_css(); }
            else{ // 再処理は表示CSSをリセット
                hide_css();
                open_css();
                setTimeout(()=>{
                    if(get==1){
                        rewrite_css(); }
                }, 200); } // 処理までにCSSコード取得のタイミング必要

            setTimeout(()=>{
                open_skinselect();
            }, 600);

            setTimeout(()=>{
                editor.disabled=false;
                editor.style.visibility='visible';
            }, 1500); }}


    editor.onclick=function(){
        let open_url='https://blog.ameba.jp/ucs/editcss/srvcssupdateinput.do';
        window.open(open_url, null, 'top=50,left=100,width=830,height=920'); }

    change_skin.onclick=function(){
        let open_url='https://blog.ameba.jp/ucs/skin/skinselecttop.do';
        window.open(open_url, null, 'top=50,left=100,width=895,height=920'); }

    sidebar.onclick=function(){
        let open_url='https://blog.ameba.jp/ucs/sidebar/srvsidebarupdateinput.do';
        window.open(open_url, null, 'top=50,left=100,width=830,height=700'); }

} // coordinate()



function task_navi_reset(){
    let b2=document.querySelector('#b2');
    let b3=document.querySelector('#b3');
    let b4=document.querySelector('#b4');
    let editor=document.querySelector('#editor');
    b1_open=0;
    b2_open=0;
    if(check_user_css()==0){
        b2.disabled=true;
        b3.disabled=true;
        if(redo_navi==0){
            editor.disabled=true;
            editor.style.visibility='hidden'; }
        else{
            editor.disabled=false;
            editor.style.visibility='visible'; }}
    if(check_user_css()==1){
        b2.disabled=true;
        b3.disabled=true;
        editor.disabled=false;
        editor.style.visibility='visible'; }}



function open_css(){
    let page_html=document.querySelector('html');
    skin_code=page_html.getAttribute('data-skin-code');
    if(skin_code){
        disp_css(0); // コード表示枠「#output」を表示
        disp_css(1); // スキンコード名を表示
        document.querySelector('#output_n').innerHTML='skin-code  ：　'+ skin_code;

        if(skin_code.includes('cssedit')){
            disp_css(3); } // ページのスキンがCSS編集用デザインの場合は表示

        let xmlhttp=new XMLHttpRequest();

        let css_url='https://stat100.ameba.jp/p_skin/'+ skin_code +'/css/skin.css';
        xmlhttp.open('GET', css_url ); // CSSコードを取得する
        xmlhttp.send();

        xmlhttp.onreadystatechange=function(){
            if(xmlhttp.readyState==4){
                if(xmlhttp.status==200){
                    let output=document.querySelector('#output');
                    output.textContent=xmlhttp.responseText; // 取得したCSSを output枠に表示
                    get=1; } // 取得終了のフラグ
                else{
                    alert('status='+ xmlhttp.status); }}}}
} // open_css()



function disp_css(mode){
    let output;
    let style;
    if(mode==0){
        output=document.createElement('textarea'); }
    else{
        output=document.createElement('div'); }

    if(mode==0){
        style=
            'position: fixed; top: 126px; right: 20px; width: 600px; height: 30vh; '+
            'padding: 15px; border: 8px solid #90a4ae; color: #000; background: #fff; '+
            'font: normal 16px/1.6 Meiryo; outline: none; white-space: pre; '+
            'resize: vertical; z-index: 2020;';
        output.setAttribute('id', 'output');
        output.setAttribute('readonly', ''); }
    if(mode==1){
        style=
            'position: fixed; top: 90px; right: 20px; width: 600px; color: #fff; '+
            'padding: 2px 15px 0; border: 8px solid #90a4ae; background: #90a4ae; '+
            'font: bold 16px/1.6 Meiryo; z-index: 2020;';
        output.setAttribute('id', 'output_n'); }
    if(mode==2 || mode==3){
        style=
            'position: fixed; top: 20px; right: 20px; width: 600px; color: #fff; '+
            'padding: 5px 15px 0; font: normal 16px/1.6 Meiryo; z-index: 2020; ';
        if(mode==2){
            style+='border: 8px solid #2196f3; background: #2196f3;' }
        if(mode==3){
            style+='border: 8px solid #90a4ae; background: #90a4ae;' }
        output.setAttribute('id', 'output_s'); }
    if(mode==2){
        if(ua==0){
            output.innerHTML=
                'このページの移植用のCSSを作成して サブ画面のCSS編集枠に貼付けました<br>'+
                '　▶ サブ画面のCSS編集枠の内容を保存してください'; }
        if(ua==1){
            output.innerHTML=
                'このページの移植用のCSSを作成して クリップボードにコピーしました<br>'+
                '　▶ サブ画面のCSS編集枠に CSSを貼り付けた上で保存してください'; }}
    if(mode==3){
        output.innerHTML=
            '⚪ このページは CSS編集用デザインのスキンを使用しています<br>'+
            '　　以下は CSS編集用デザインの基本CSSで 移植処理の対象ではありません'; }

    output.setAttribute('style', style)

    if(!document.querySelector('#output')){
        document.querySelector('html').appendChild(output); }
    if(!document.querySelector('#output_n')){
        document.querySelector('html').appendChild(output); }
    if(!document.querySelector('#output_s')){
        document.querySelector('html').appendChild(output); }}


function hide_css(){
    if(document.querySelector('#output')){
        document.querySelector('#output').remove(); }
    if(document.querySelector('#output_n')){
        document.querySelector('#output_n').remove(); }
    if(document.querySelector('#output_s')){
        document.querySelector('#output_s').remove(); }}



function rewrite_css(){
    if(check_user_css()==0){
        let output=document.querySelector('#output')
        let total_css='';

        if(skin_code.includes('wu_pf')){
            let reset_css=[
                '@charset "utf-8";',
                '',
                '/*===========================================',
                'CSS編集用デザインをスキン移植で利用する場合のリセットコード',
                '============================================*/',
                '',
                '.skinFrame {',
                'padding-top: 0; }',
                '',
                '.skinBlogHeadingGroupArea {',
                'padding: 0; }',
                '',
                '.skinDescription {',
                'color: #fff; }',
                '',
                '.skinMessageBoard {',
                'border-top: none;',
                'border-bottom: none;',
                'background: none; }',
                '',
                '.skinMessageBoard3 { padding: 0; }',
                '',
                '.skinArticle {',
                'padding: 0;',
                'border: none;',
                'background: none; }',
                '',
                '.skinArticleHeader {',
                'margin: 0;',
                'padding: 0;',
                'border-left: none; }',
                '',
                '.skinArticleTitle,',
                '.skinArticleTitle:hover,',
                '.skinArticleTitle:focus,',
                '.skinArticleTitle:visited {',
                'font-weight: normal; }',
                '',
                '.skinArticleBody2 {',
                'margin: 0; }',
                '',
                '.skinArticleFooter {',
                'border-top: none; }',
                '',
                '.skinMenu {',
                'background: none; }',
                '',
                '.skinMenuHeader {',
                'padding: 0;',
                'background: none; }',
                '',
                '.skinMenuBody {',
                'margin: 0;',
                'padding: 0;',
                'background: none; }',
                '',
                '.skinSubHr,',
                '.skinSubList li {',
                'border-bottom: none; }',
                '',
                '',
                '',
                ''].join('\n');

            total_css=reset_css; } // 旧タイプのスキンのみ reset_cssを追加

        skincss=output.textContent;
        let rewite_url='https://stat100.ameba.jp/p_skin/'+ skin_code +'/img/';
        skincss=skincss.replace(/\.\.\/img\//g, rewite_url); //「..img」コードの修正

        total_css+=skincss;

        let original='\n\n/* Original Skin Code:::' + skin_code +'::: */\n\n\n';
        total_css+=original; // 元のスキン情報を追加

        output.textContent=total_css;
        navigator.clipboard.writeText(total_css); // クリップボードにコピー
        disp_css(2); // CSS変換処理が済んだ事を報告

    }} // rewrite_css()



function open_skinselect(){
    if(!user_check()){ // 別ユーザーのページで実行不可：CSS編集デザインのCSSを失うのを防止
        alert(
            ' ⛔ このページのスキンを移殖するCSS作成とコピーが出来ましたが\n'+
            '　　「CSS編集用デザイン」にスキン変更する機能は動作しません。\n'+
            '　　これは、既に「CSS編集用デザイン」を運用しているユーザーが\n'+
            '　　誤って適用中の「ユーザーCSS」を失う事を防ぐためです。\n\n'+
            '　　「CSS編集用デザイン」への変更は、手動で行ってください。'); }
    else{
        manual_set_get();
        let open_url='https://blog.ameba.jp/ucs/skin/srvskinpreview.do?'+
            'skin_code='+ type + '&use_layout=' + layout + '&sc'
        window.open(open_url, null, 'top=10,left=40,width=830,height=920'); }}


function user_check(){
    let login_user;
    let blog_user=window.location.pathname.split('/')[1];
    if(blog_user){
        login_user=document.querySelector('._w6MHwCAy').textContent;
        if(login_user){
            if(blog_user==login_user){
                return true; }}}}



window.addEventListener('DOMContentLoaded', function(){
    let designTop=document.querySelector('#designTop');
    let category=document.querySelector('#category');
    let editCss=document.querySelector('#editCss');
    let previewDesign=document.querySelector('#previewDesign');
    let completeMsg=document.querySelector('#completeMsgArea');
    let editArrange=document.querySelector('#editArrange');


    if(designTop || category){ //「デザインの変更」の画面で動作する
        edit_w();
        select_new_skin(); }
    else if(editCss){ //「CSSの編集」の画面で動作する
        edit_w();
        editcss(); }
    else if(previewDesign){ //「ブログデザインの表示確認」の画面で動作する
        set_newskin(); }
    else if(completeMsg){ //「ブログデザイン適用完了」の画面で動作する
        complete(); }
    else if(editArrange){ //「サイドバーの配置設定」の画面で動作する
        edit_w(); }});



function edit_w(){
    let style=
        '<style id="edit_w">'+
        '#globalHeader, .l-ucs-sidemenu-area, #ucsMainRight, '+
        'ul.editTools , .infoArea , #footerAd, #globalFooter, #ucsHeader '+
        '{ display: none !important; } '+
        '#ucsContent { max-width: 810px; background: #fff; margin-bottom: 0; '+
        'border-radius: 0; } '+
        '#ucsContent::before { content: none; } '+
        '#ucsMain, #ucsMainContent { font-size: 16px; padding-top: 14px; '+
        'background: none; } '+
        '#ucsMainLeft { width: 808px !important; } '+
        '#ucsMainContent h1, #ucsMainLeft h1 { font: bold 21px Meiryo; '+
        'margin: 0 -16px 15px; padding: 4px 15px 8px; } '+
        '.moreLink a { font-weight: bold; color: #000; } '+
        '.textInputArea .textarea1 { width: 715px !important; height: 320px; '+
        'font-size: 16px; } .limText { margin: 0; } '+
        'html { overflow-y: scroll !important; } '+
        '#editCss #ucsMain { padding: 14px 0 10px; } '+
        '#editCss #notes { font-size: 15px; } '+
        '#editCss #myframe { display: none; } '+
        '#editCss #contentsForm textarea { width: 720px !important; '+
        'height: 500px; } '+
        '#editCss .actionControl { padding-bottom: 20px; } '+
        '#editCss .actionControl .msg { margin: -35px 0 10px; }'+
        '</style>';

    if(!document.querySelector('#edit_w')){
        document.body.insertAdjacentHTML('beforeend', style); }

} // edit_w()



function select_new_skin(){
    let ucsContent=document.querySelector('#ucsContent');
    ucsContent.style.maxWidth='875px';

    let design_img=document.querySelector('#design .skinThum img');
    let img_src=design_img.getAttribute('src');
    if(img_src.includes('pf_cssedit')){ // CSS編集用デザインの環境の場合はアラート表示
        alert(
            "　🔴 現在のブログは「CSS編集用デザイン」を適用しています\n\n"+
            "　　スキン変更を行うと 現在のページをデザインする「ユーザーCSS」を失い\n"+
            "　　再び元のデザインに戻す事ができなくなります。\n"+
            "　　これを防ぐために、スキンを変更する前に「ユーザーCSS」をバックアップ\n"+
            "　　する事を強くお勧めします。 バックアップは「CSS編集画面」を開いて\n"+
            "　　「編集枠」の全内容をメモ帳等にコピーして保存するだけです。"); }}



function editcss(){
    let blog_sw=
        '<input id="blog" type="submit" value="ブログ画面">'+
        '<style>'+
        '.textarea1 { font-size: 16px; } '+
        '.actionControl { padding-bottom: 30px; } '+
        'input[name="save_mode"], #blog { font: normal 16px Meiryo; width: 150px; '+
        'padding: 3px 8px 1px; color: #fff; cursor: pointer; -moz-appearance: none; } '+
        'input[name="save_mode"] { box-shadow: inset 0 0 0 40px #00a08e; } '+
        '#blog { margin-left: 30px; box-shadow: inset 0 0 0 40px #2196f3; }'+
        '</style>';

    let actionControl=document.querySelector('.actionControl');
    if(!document.querySelector('#blog') && actionControl){
        actionControl.insertAdjacentHTML('beforeend', blog_sw); }

    let blog=document.querySelector('#blog');
    let my_blog=document.querySelector('#ucsSubMenu li:last-child a');
    blog.onclick=function(){
        my_blog.click(); }

    let btnPrimary=document.querySelector('input[name="save_mode"]');
    btnPrimary.classList.remove('btnPrimary');

    let query=location.href.toString().slice(-3); // 自動処理でCSS編集を開いた場合
    if(query=='?sc'){
        let css_text=document.querySelector('#contentsForm textarea');

        // クリップボードの内容をCSS編集画面に貼り付ける
        if(ua==0){
            navigator.clipboard.readText()
                .then(function(text){
                css_text.textContent=text; });

            setTimeout(()=>{
                alert("　　「保存」 のボタンを押してCSSコードを保存します");
            }, 400); }

        else if(ua==1){
            css_text.textContent='';

            setTimeout(()=>{
                alert(
                    "　　❶ 「Ctrl+V」 のキー操作でCSSコードを貼付けます\n\n"+
                    "　　❷ 「保存」 のボタンを押してCSSコードを保存します");
                css_text.focus(); }, 400); }}

} // editcss()



function set_newskin(){
    let query=location.href.toString().slice(-3); // 自動処理で開いた場合
    if(query=='&sc'){
        let apply=document.querySelector('#sbmtBtn input[name="applyBtn"]');
        setTimeout(()=>{
            if(apply){
                apply.click(); }
        }, 200); }}



function complete(){
    let cssCustom=document.querySelector('.cssCustomBtn');
    let link_Blg=document.querySelector('.pubBlogBtn a');
    let link_Cus=document.querySelector('.cssCustomBtn a');
    if(cssCustom){
        link_Cus.setAttribute('href', 'https://blog.ameba.jp/ucs/editcss/srvcssupdateinput.do?sc');
        setTimeout(()=>{
            link_Cus.click();
        }, 200); }
    else{
        link_Blg.removeAttribute('target');
        setTimeout(()=>{
            link_Blg.click();
        }, 200); }}
