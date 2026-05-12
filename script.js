(function () {
  "use strict";

  const STORAGE_KEY = "relatorioLmg21";

  let dados = [];

  const dom = {
    form: document.getElementById("formEntrega"),
    tbody: document.getElementById("tbodyRelatorio"),
    tbodyAgrup: document.getElementById("tbodyAgrupamento"),
    contagem: document.getElementById("contagem"),
    totalOfertados: document.getElementById("totalOfertados"),
    totalRetirados: document.getElementById("totalRetirados"),
    totalPct: document.getElementById("totalPct"),
    totalNoShow: document.getElementById("totalNoShow"),
    hubDisplay: document.getElementById("hubDisplay"),
    btnLimpar: document.getElementById("btnLimpar"),
    btnExportPDF: document.getElementById("btnExportPDF"),
    btnExportExcel: document.getElementById("btnExportExcel"),
    modal: document.getElementById("confirmModal"),
    modalConfirm: document.getElementById("modalConfirm"),
    modalCancel: document.getElementById("modalCancel"),
  };

  const inputs = {
    data: document.getElementById("data"),
    supervisor: document.getElementById("supervisor"),
    encarregado: document.getElementById("encarregado"),
    hub: document.getElementById("hub"),
    entregador: document.getElementById("entregador"),
    regiao: document.getElementById("regiao"),
    turno: document.getElementById("turno"),
    horario: document.getElementById("horario"),
    carrosOfertados: document.getElementById("carrosOfertados"),
    carrosRetirados: document.getElementById("carrosRetirados"),
    pctExpedidos: document.getElementById("pctExpedidos"),
    noShow: document.getElementById("noShow"),
  };

  function carregarStorage() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        dados = JSON.parse(raw);
      }
    } catch (_) {
      dados = [];
    }
  }

  function salvarStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dados));
  }

  function hoje() {
    const d = new Date();
    const mes = String(d.getMonth() + 1).padStart(2, "0");
    const dia = String(d.getDate()).padStart(2, "0");
    return `${d.getFullYear()}-${mes}-${dia}`;
  }

  function setDefaults() {
    inputs.data.value = hoje();
    inputs.turno.value = "AM";
    inputs.carrosOfertados.value = "0";
    inputs.carrosRetirados.value = "0";
    inputs.pctExpedidos.value = "0";
    inputs.noShow.value = "0";
  }

  function formatDate(bruta) {
    if (!bruta) return "";
    const partes = bruta.split("-");
    if (partes.length !== 3) return bruta;
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
  }

  function toNumber(val) {
    const n = parseInt(val, 10);
    return isNaN(n) ? 0 : n;
  }

  function getFormData() {
    return {
      data: inputs.data.value,
      supervisor: inputs.supervisor.value.trim(),
      encarregado: inputs.encarregado.value.trim(),
      hub: inputs.hub.value.trim(),
      entregador: inputs.entregador.value.trim(),
      regiao: inputs.regiao.value.trim(),
      turno: inputs.turno.value,
      horario: inputs.horario.value,
      carrosOfertados: toNumber(inputs.carrosOfertados.value),
      carrosRetirados: toNumber(inputs.carrosRetirados.value),
      pctExpedidos: toNumber(inputs.pctExpedidos.value),
      noShow: toNumber(inputs.noShow.value),
    };
  }

  function validarForm(d) {
    if (!d.data) return "Informe a data.";
    if (!d.supervisor) return "Informe o supervisor.";
    if (!d.encarregado) return "Informe o encarregado.";
    if (!d.hub) return "Informe o HUB.";
    if (!d.entregador) return "Informe o entregador.";
    if (!d.regiao) return "Informe a região/bairro.";
    if (!d.horario) return "Informe o horário.";
    return null;
  }

  function adicionarRegistro(d) {
    dados.push({
      id: Date.now() + Math.random(),
      ...d,
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
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  function renderizarTabela() {
    const html = dados
      .map(function (item) {
        return (
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
          item.turno +
          "</td>" +
          "<td>" +
          item.horario.slice(0, 5) +
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
          "</tr>"
        );
      })
      .join("");

    dom.tbody.innerHTML = html;
    dom.contagem.textContent = dados.length;

    dom.tbody.querySelectorAll(".btn-excluir").forEach(function (btn) {
      btn.addEventListener("click", function () {
        const id = parseFloat(btn.getAttribute("data-id"));
        excluirRegistro(id);
      });
    });
  }

  function calcularTotais() {
    let somaO = 0,
      somaR = 0,
      somaP = 0,
      somaN = 0;

    dados.forEach(function (item) {
      somaO += item.carrosOfertados;
      somaR += item.carrosRetirados;
      somaP += item.pctExpedidos;
      somaN += item.noShow;
    });

    dom.totalOfertados.textContent = somaO;
    dom.totalRetirados.textContent = somaR;
    dom.totalPct.textContent = somaP;
    dom.totalNoShow.textContent = somaN;
  }

  function renderizarAgrupamento() {
    var map = {};
    dados.forEach(function (item) {
      var key = item.data;
      if (!map[key]) {
        map[key] = {
          data: item.data,
          supervisor: item.supervisor,
          encarregado: item.encarregado,
          carrosOfertados: 0,
          carrosRetirados: 0,
          pctExpedidos: 0,
          noShow: 0,
          entregadores: [],
        };
      }
      var g = map[key];
      g.carrosOfertados += item.carrosOfertados;
      g.carrosRetirados += item.carrosRetirados;
      g.pctExpedidos += item.pctExpedidos;
      g.noShow += item.noShow;
      if (g.entregadores.indexOf(item.entregador) === -1) {
        g.entregadores.push(item.entregador);
      }
    });

    var keys = Object.keys(map).sort();
    var html = keys
      .map(function (key) {
        var g = map[key];
        var dataFmt = formatDate(g.data);
        var qtdEntregadores = g.entregadores.length;
        return (
          "<tr>" +
          "<td>" +
          dataFmt +
          "</td>" +
          "<td>" +
          esc(g.supervisor) +
          "</td>" +
          "<td>" +
          esc(g.encarregado) +
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
          qtdEntregadores +
          "</td>" +
          "</tr>"
        );
      })
      .join("");

    dom.tbodyAgrup.innerHTML = html;
  }

  function renderizar() {
    renderizarTabela();
    calcularTotais();
    renderizarAgrupamento();

    if (dados.length > 0) {
      dom.hubDisplay.textContent = dados[0].hub;
    } else {
      dom.hubDisplay.textContent = "LMG-21 Muriaé";
    }
  }

  function exportarExcel() {
    if (dados.length === 0) {
      alert("Nenhum registro para exportar.");
      return;
    }

    var nomesColunas = [
      "DATA", "SUPERVISOR/COORDENADOR", "ENCARREGADO", "HUB",
      "ENTREGADOR", "REGIÃO/ BAIRRO", "AM/PM", "HORÁRIO INCIADO",
      "CARROS OFERTADOS", "CARROS RETIRADOS", "PCT EXPEDIDOS", "NO SHOW"
    ];

    var colLarguras = [15.74, 26.36, 13.99, 14.80, 40.63, 25.96, 9.68, 21.39, 18.70, 18.16, 14.26, 10.76];

    function paraValorData(str) {
      if (!str) return null;
      var partes = str.split("-");
      if (partes.length !== 3) return null;
      var d = new Date(partes[0], partes[1] - 1, partes[2]);
      if (isNaN(d.getTime())) return null;
      return d;
    }

    function estiloCabecalho() {
      return {
        font: { name: "Calibri", size: 11, bold: true, color: { argb: "FFFFFFFF" } },
        fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FF4472C4" } },
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
    nomesColunas.forEach(function (nome, idx) {
      var cell = cabRow.getCell(idx + 1);
      cell.value = nome;
      cell.style = estiloCabecalho();
    });

    dados.forEach(function (item, i) {
      var rowIdx = i + 2;
      var row = ws.getRow(rowIdx);

      var dataCel = row.getCell(1);
      dataCel.value = paraValorData(item.data);
      dataCel.numFmt = "mm-dd-yy";

      row.getCell(2).value = item.supervisor;
      row.getCell(3).value = item.encarregado;
      row.getCell(4).value = item.hub;
      row.getCell(5).value = item.entregador;
      row.getCell(6).value = item.regiao;
      row.getCell(7).value = item.turno;

      var horaCel = row.getCell(8);
      var hp = item.horario.split(":");
      horaCel.value = new Date(1970, 0, 1, parseInt(hp[0], 10) || 0, parseInt(hp[1], 10) || 0);
      horaCel.numFmt = "h:mm";

      row.getCell(9).value = item.carrosOfertados;
      row.getCell(10).value = item.carrosRetirados;
      row.getCell(11).value = item.pctExpedidos;
      row.getCell(12).value = item.noShow;

      for (var col = 1; col <= 12; col++) {
        row.getCell(col).style = estiloDado();
      }
    });

    var now = new Date();
    var filename =
      "Relatório Reporte Base " +
      (dados.length > 0 ? dados[0].hub : "LMG-21") +
      ".xlsx";

    wb.xlsx.writeBuffer().then(function (buffer) {
      var blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      saveAs(blob, filename);
    });
  }

  function limparCampos() {
    inputs.entregador.value = "";
    inputs.regiao.value = "";
    inputs.horario.value = "";
    inputs.carrosOfertados.value = "0";
    inputs.carrosRetirados.value = "0";
    inputs.pctExpedidos.value = "0";
    inputs.noShow.value = "0";
    inputs.turno.value = "AM";
    inputs.entregador.focus();
  }

  function handleFormSubmit(e) {
    e.preventDefault();
    const d = getFormData();
    const erro = validarForm(d);
    if (erro) {
      alert(erro);
      return;
    }
    adicionarRegistro(d);
    limparCampos();
  }

  function init() {
    carregarStorage();

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

    dom.btnExportPDF.addEventListener("click", function () {
      if (dados.length === 0) {
        alert("Nenhum registro para exportar.");
        return;
      }
      window.print();
    });

    dom.btnExportExcel.addEventListener("click", exportarExcel);

    inputs.hub.addEventListener("input", function () {
      dom.hubDisplay.textContent = inputs.hub.value || "LMG-21 Muriaé";
    });
  }

  document.addEventListener("DOMContentLoaded", init);
})();
