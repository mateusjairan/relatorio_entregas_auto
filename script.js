(function () {
  "use strict";

  const STORAGE_KEY = "relatorioLmg21";

  let dados = [];


  function $(id) {
    return document.getElementById(id);
  }

  function safeText(el, value) {
    if (el) el.textContent = value;
  }

  var dom = {
    form: $("formEntrega"),
    tbody: $("tbodyRelatorio"),
    tbodyAgrup: $("tbodyAgrupamento"),
    contagem: $("contagem"),
    totalRotas: $("totalRotas"),
    totalOfertados: $("totalOfertados"),
    totalRetirados: $("totalRetirados"),
    totalPct: $("totalPct"),
    totalNoShow: $("totalNoShow"),
    hubDisplay: $("hubDisplay"),
    btnLimpar: $("btnLimpar"),
    btnExportExcel: $("btnExportExcel"),

    modal: $("confirmModal"),
    modalConfirm: $("modalConfirm"),
    modalCancel: $("modalCancel"),
  };

  var inputs = {
    data: $("data"),
    supervisor: $("supervisor"),
    encarregado: $("encarregado"),
    hub: $("hub"),
    rotasHubOfertados: $("rotasHubOfertados"),
    entregador: $("entregador"),
    regiao: $("regiao"),
    atCafs: $("atCafs"),
    turno: $("turno"),
    horario: $("horario"),
    carrosOfertados: $("carrosOfertados"),
    carrosRetirados: $("carrosRetirados"),
    pctExpedidos: $("pctExpedidos"),
    noShow: $("noShow"),
  };

  function carregarStorage() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        dados = JSON.parse(raw);
        for (var i = 0; i < dados.length; i++) {
          dados[i].rotasHubOfertados = toNumber(dados[i].rotasHubOfertados);
          dados[i].carrosOfertados = toNumber(dados[i].carrosOfertados);
          dados[i].carrosRetirados = toNumber(dados[i].carrosRetirados);
          dados[i].pctExpedidos = toNumber(dados[i].pctExpedidos);
          dados[i].noShow = toNumber(dados[i].noShow);
        }
      }
    } catch (_) {
      dados = [];
    }
  }

  function salvarStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dados));
  }

  function hoje() {
    var d = new Date();
    return (
      d.getFullYear() +
      "-" +
      String(d.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(d.getDate()).padStart(2, "0")
    );
  }

  function setDefaults() {
    if (inputs.data) inputs.data.value = hoje();
    if (inputs.turno) inputs.turno.value = "AM";
    if (inputs.rotasHubOfertados) inputs.rotasHubOfertados.value = "0";
    if (inputs.carrosOfertados) inputs.carrosOfertados.value = "0";
    if (inputs.carrosRetirados) inputs.carrosRetirados.value = "0";
    if (inputs.pctExpedidos) inputs.pctExpedidos.value = "0";
    if (inputs.noShow) inputs.noShow.value = "0";
  }

  function formatDate(bruta) {
    if (!bruta) return "";
    var partes = bruta.split("-");
    if (partes.length !== 3) return bruta;
    return partes[2] + "/" + partes[1] + "/" + partes[0];
  }

  function toNumber(val) {
    var n = parseInt(val, 10);
    return isNaN(n) ? 0 : n;
  }

  function validarForm(d) {
    if (!d.data) return "Informe a data.";
    if (!d.supervisor) return "Informe o supervisor.";
    if (!d.encarregado) return "Informe o encarregado.";
    if (!d.hub) return "Informe o HUB.";
    if (!d.entregador) return "Informe o entregador.";
    if (!d.regiao) return "Informe a região/bairro.";
    if (!d.atCafs) return "Informe o AT/CAFs.";
    if (!d.horario) return "Informe o horário.";
    return null;
  }

  function getFormData() {
    return {
      data: inputs.data ? inputs.data.value : "",
      supervisor: inputs.supervisor ? inputs.supervisor.value.trim() : "",
      encarregado: inputs.encarregado ? inputs.encarregado.value.trim() : "",
      hub: inputs.hub ? inputs.hub.value.trim().toUpperCase() : "",
      rotasHubOfertados: inputs.rotasHubOfertados
        ? toNumber(inputs.rotasHubOfertados.value)
        : 0,
      entregador: inputs.entregador ? inputs.entregador.value.trim() : "",
      regiao: inputs.regiao ? inputs.regiao.value.trim() : "",
      atCafs: inputs.atCafs ? inputs.atCafs.value.trim() : "",
      turno: inputs.turno ? inputs.turno.value : "",
      horario: inputs.horario ? inputs.horario.value : "",
      carrosOfertados: inputs.carrosOfertados
        ? toNumber(inputs.carrosOfertados.value)
        : 0,
      carrosRetirados: inputs.carrosRetirados
        ? toNumber(inputs.carrosRetirados.value)
        : 0,
      pctExpedidos: inputs.pctExpedidos
        ? toNumber(inputs.pctExpedidos.value)
        : 0,
      noShow: inputs.noShow ? toNumber(inputs.noShow.value) : 0,
    };
  }

  function adicionarRegistro(d) {
    dados.push({
      id: Date.now() + Math.random(),
      data: d.data,
      supervisor: d.supervisor,
      encarregado: d.encarregado,
      hub: d.hub,
      rotasHubOfertados: d.rotasHubOfertados,
      entregador: d.entregador,
      regiao: d.regiao,
      atCafs: d.atCafs,
      turno: d.turno,
      horario: d.horario,
      carrosOfertados: d.carrosOfertados,
      carrosRetirados: d.carrosRetirados,
      pctExpedidos: d.pctExpedidos,
      noShow: d.noShow,
    });
    salvarStorage();
    renderizar();
  }

  function excluirRegistro(id) {
    dados = dados.filter(function (item) {
      return item.id !== id;
    });
    salvarStorage();
    renderizar();
  }

  function limparDados() {
    dados = [];
    salvarStorage();
    renderizar();
  }

  function esc(str) {
    var div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  function renderizarTabela() {
    if (!dom.tbody) return;
    var html = "";
    for (var i = 0; i < dados.length; i++) {
      var item = dados[i];
      html +=
        "<tr>" +
        "<td>" +
        formatDate(item.data) +
        "</td>" +
        "<td>" +
        esc(item.supervisor) +
        "</td>" +
        "<td>" +
        esc(item.encarregado) +
        "</td>" +
        "<td>" +
        esc(item.hub) +
        "</td>" +
        "<td>" +
        esc(item.entregador) +
        "</td>" +
        "<td>" +
        esc(item.regiao) +
        "</td>" +
        "<td>" +
        esc(item.atCafs) +
        "</td>" +
        "<td>" +
        item.turno +
        "</td>" +
        "<td>" +
        (item.horario ? item.horario.slice(0, 5) : "") +
        "</td>" +
        "<td>" +
        item.rotasHubOfertados +
        "</td>" +
        "<td>" +
        item.carrosOfertados +
        "</td>" +
        "<td>" +
        item.carrosRetirados +
        "</td>" +
        "<td>" +
        item.pctExpedidos +
        "</td>" +
        "<td>" +
        item.noShow +
        "</td>" +
        '<td><button class="btn-excluir" data-id="' +
        item.id +
        '" title="Excluir">&times;</button></td>' +
        "</tr>";
    }
    dom.tbody.innerHTML = html;
    safeText(dom.contagem, dados.length);

    var botoes = dom.tbody.querySelectorAll(".btn-excluir");
    for (var j = 0; j < botoes.length; j++) {
      botoes[j].addEventListener("click", function () {
        excluirRegistro(parseFloat(this.getAttribute("data-id")));
      });
    }
  }

  function calcularTotais() {
    var somaRota = 0,
      somaO = 0,
      somaR = 0,
      somaP = 0,
      somaN = 0;
    for (var i = 0; i < dados.length; i++) {
      var item = dados[i];
      somaRota += item.rotasHubOfertados;
      somaO += item.carrosOfertados;
      somaR += item.carrosRetirados;
      somaP += item.pctExpedidos;
      somaN += item.noShow;
    }
    safeText(dom.totalRotas, somaRota);
    safeText(dom.totalOfertados, somaO);
    safeText(dom.totalRetirados, somaR);
    safeText(dom.totalPct, somaP);
    safeText(dom.totalNoShow, somaN);
  }

  function renderizarAgrupamento() {
    if (!dom.tbodyAgrup) return;
    var map = {};
    for (var i = 0; i < dados.length; i++) {
      var item = dados[i];
      var key = item.data;
      if (!map[key]) {
        map[key] = {
          data: item.data,
          supervisor: item.supervisor,
          encarregado: item.encarregado,
          rotasHubOfertados: 0,
          carrosOfertados: 0,
          carrosRetirados: 0,
          pctExpedidos: 0,
          noShow: 0,
          entregadores: [],
        };
      }
      var g = map[key];
      g.rotasHubOfertados += item.rotasHubOfertados;
      g.carrosOfertados += item.carrosOfertados;
      g.carrosRetirados += item.carrosRetirados;
      g.pctExpedidos += item.pctExpedidos;
      g.noShow += item.noShow;
      if (g.entregadores.indexOf(item.entregador) === -1) {
        g.entregadores.push(item.entregador);
      }
    }
    var keys = Object.keys(map).sort();
    var html = "";
    for (var j = 0; j < keys.length; j++) {
      var g = map[keys[j]];
      html +=
        "<tr>" +
        "<td>" +
        formatDate(g.data) +
        "</td>" +
        "<td>" +
        esc(g.supervisor) +
        "</td>" +
        "<td>" +
        esc(g.encarregado) +
        "</td>" +
        "<td>" +
        g.rotasHubOfertados +
        "</td>" +
        "<td>" +
        g.carrosOfertados +
        "</td>" +
        "<td>" +
        g.carrosRetirados +
        "</td>" +
        "<td>" +
        g.pctExpedidos +
        "</td>" +
        "<td>" +
        g.noShow +
        "</td>" +
        "<td>" +
        g.entregadores.length +
        "</td>" +
        "</tr>";
    }
    dom.tbodyAgrup.innerHTML = html;
  }

  function renderizar() {
    renderizarTabela();
    calcularTotais();
    renderizarAgrupamento();
    if (dom.hubDisplay) {
      dom.hubDisplay.textContent =
        dados.length > 0 ? dados[0].hub : "LMG-21 Muriaé";
    }


  }

  function gerarBlobExcel() {
    var nomesColunas = [
      "DATA",
      "SUPERVISOR/COORDENADOR",
      "ENCARREGADO",
      "HUB",
      "ENTREGADOR",
      "REGIÃO/ BAIRRO",
      "AT/CAFs",
      "AM/PM",
      "HORÁRIO INCIADO",
      "ROTAS HUB OFERTADOS",
      "CARROS OFERTADOS",
      "CARROS RETIRADOS",
      "PCT EXPEDIDOS",
      "NO SHOW",
    ];
    var colLarguras = [
      15.74, 26.36, 13.99, 14.8, 40.63, 25.96, 18.7, 9.68, 21.39, 18.7, 18.7,
      18.16, 14.26, 10.76,
    ];

    function paraValorData(str) {
      if (!str) return null;
      var partes = str.split("-");
      if (partes.length !== 3) return null;
      var d = new Date(partes[0], partes[1] - 1, partes[2]);
      return isNaN(d.getTime()) ? null : d;
    }

    function estiloCabecalho() {
      return {
        font: {
          name: "Calibri",
          size: 11,
          bold: true,
          color: { argb: "FFFFFFFF" },
        },
        fill: {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FF4472C4" },
        },
        alignment: { horizontal: "center", vertical: "center" },
        border: {
          top: { style: "thin", color: { argb: "FF000000" } },
          bottom: { style: "thin", color: { argb: "FF000000" } },
          left: { style: "thin", color: { argb: "FF000000" } },
          right: { style: "thin", color: { argb: "FF000000" } },
        },
      };
    }

    function estiloDado() {
      return {
        font: { name: "Calibri", size: 11, color: { argb: "FF000000" } },
        alignment: { horizontal: "center" },
        border: {
          top: { style: "thin", color: { argb: "FF000000" } },
          bottom: { style: "thin", color: { argb: "FF000000" } },
          left: { style: "thin", color: { argb: "FF000000" } },
          right: { style: "thin", color: { argb: "FF000000" } },
        },
      };
    }

    var wb = new ExcelJS.Workbook();
    wb.creator = "SB Farma";
    wb.created = new Date();
    var ws = wb.addWorksheet("Planilha1", {
      pageSetup: { orientation: "portrait", paperSize: 9 },
    });

    for (var c = 0; c < colLarguras.length; c++) {
      ws.getColumn(c + 1).width = colLarguras[c];
    }

    var cabRow = ws.getRow(1);
    for (var c2 = 0; c2 < nomesColunas.length; c2++) {
      var cell = cabRow.getCell(c2 + 1);
      cell.value = nomesColunas[c2];
      cell.style = estiloCabecalho();
    }

    for (var i = 0; i < dados.length; i++) {
      var item = dados[i];
      var row = ws.getRow(i + 2);

      var dataCel = row.getCell(1);
      dataCel.value = paraValorData(item.data);
      dataCel.numFmt = "mm-dd-yy";

      row.getCell(2).value = (item.supervisor || "").toUpperCase();
      row.getCell(3).value = (item.encarregado || "").toUpperCase();
      row.getCell(4).value = (item.hub || "").toUpperCase();
      row.getCell(5).value = (item.entregador || "").toUpperCase();
      row.getCell(6).value = (item.regiao || "").toUpperCase();
      row.getCell(7).value = (item.atCafs || "").toUpperCase();
      row.getCell(8).value = (item.turno || "").toUpperCase();

      var hp = (item.horario || "00:00").split(":");
      var h = parseInt(hp[0], 10) || 0;
      var m = parseInt(hp[1], 10) || 0;
      row.getCell(9).value =
        (h < 10 ? "0" : "") + h + ":" + (m < 10 ? "0" : "") + m;

      row.getCell(10).value = item.rotasHubOfertados;
      row.getCell(11).value = item.carrosOfertados;
      row.getCell(12).value = item.carrosRetirados;
      row.getCell(13).value = item.pctExpedidos;
      row.getCell(14).value = item.noShow;

      for (var col = 1; col <= 14; col++) {
        row.getCell(col).style = estiloDado();
      }
      row.getCell(1).numFmt = "mm-dd-yy";
    }

    return wb.xlsx.writeBuffer().then(function (buffer) {
      return new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
    });
  }

  function baixarBlob(blob, nome) {
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = nome;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () {
      URL.revokeObjectURL(url);
    }, 10000);
    if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
      setTimeout(function () {
        window.open(url, "_blank");
      }, 200);
    }
  }

  function exportarExcel() {
    if (dados.length === 0) {
      alert("Nenhum registro para exportar.");
      return;
    }
    var datas = [];
    for (var i = 0; i < dados.length; i++) {
      if (datas.indexOf(dados[i].data) === -1) datas.push(dados[i].data);
    }
    datas.sort();
    var parteData = datas
      .map(function (d) {
        var p = d.split("-");
        return p[2] + "/" + p[1] + "/" + p[0];
      })
      .join(" a ");
    var filename =
      "RELATÓRIO REPORTE BASE " +
      (dados.length > 0 ? dados[0].hub : "LMG-21") +
      " " + parteData +
      ".XLSX";
    gerarBlobExcel()
      .then(function (blob) {
        baixarBlob(blob, filename);
      })
      .catch(function () {
        alert("Erro ao gerar o arquivo Excel.");
      });
  }


  function limparCampos() {
    if (inputs.entregador) inputs.entregador.value = "";
    if (inputs.regiao) inputs.regiao.value = "";
    if (inputs.atCafs) inputs.atCafs.value = "";
    if (inputs.horario) inputs.horario.value = "";
    if (inputs.rotasHubOfertados) inputs.rotasHubOfertados.value = "0";
    if (inputs.carrosOfertados) inputs.carrosOfertados.value = "0";
    if (inputs.carrosRetirados) inputs.carrosRetirados.value = "0";
    if (inputs.pctExpedidos) inputs.pctExpedidos.value = "0";
    if (inputs.noShow) inputs.noShow.value = "0";
    if (inputs.turno) inputs.turno.value = "AM";
    if (inputs.entregador) inputs.entregador.focus();
  }

  function handleFormSubmit(e) {
    e.preventDefault();
    var d = getFormData();
    adicionarRegistro(d);
    limparCampos();
  }

  function init() {
    carregarStorage();

    if (!dom.form) {
      alert("Elemento cr\u00edtico ausente: form#formEntrega");
      return;
    }
    if (!dom.tbody) {
      alert("Elemento cr\u00edtico ausente: tbody#tbodyRelatorio");
      return;
    }
    if (
      !inputs.data ||
      !inputs.supervisor ||
      !inputs.encarregado ||
      !inputs.hub ||
      !inputs.entregador ||
      !inputs.regiao ||
      !inputs.atCafs ||
      !inputs.rotasHubOfertados ||
      !inputs.carrosOfertados ||
      !inputs.carrosRetirados ||
      !inputs.pctExpedidos ||
      !inputs.noShow ||
      !inputs.turno ||
      !inputs.horario
    ) {
      alert(
        "Um ou mais campos do formul\u00e1rio n\u00e3o foram encontrados no DOM.",
      );
      return;
    }

    if (dados.length === 0) {
      setDefaults();
    }

    renderizar();

    dom.form.addEventListener("submit", handleFormSubmit);

    var btnReset = dom.form.querySelector('[type="reset"]');
    if (btnReset) {
      btnReset.addEventListener("click", function (e) {
        e.preventDefault();
        limparCampos();
      });
    }

    if (dom.modal && dom.modalConfirm && dom.modalCancel) {
      dom.btnLimpar.addEventListener("click", function () {
        dom.modal.classList.add("active");
      });
      dom.modalConfirm.addEventListener("click", function () {
        limparDados();
        dom.modal.classList.remove("active");
      });
      dom.modalCancel.addEventListener("click", function () {
        dom.modal.classList.remove("active");
      });
      dom.modal.addEventListener("click", function (e) {
        if (e.target === dom.modal) {
          dom.modal.classList.remove("active");
        }
      });
    } else {
      if (dom.btnLimpar) {
        dom.btnLimpar.addEventListener("click", function () {
          if (confirm("Tem certeza que deseja limpar todos os dados?")) {
            limparDados();
          }
        });
      }
    }

    if (dom.btnExportExcel) {
      dom.btnExportExcel.addEventListener("click", exportarExcel);
    }


    if (inputs.hub && dom.hubDisplay) {
      inputs.hub.addEventListener("input", function () {
        dom.hubDisplay.textContent = inputs.hub.value || "LMG-21 Muriaé";
      });
    }
  }

  document.addEventListener("DOMContentLoaded", init);
})();
