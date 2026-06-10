import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  FlatList, StyleSheet, ScrollView, Modal, SafeAreaView,
} from 'react-native';

const ROXO = '#8B5CF6';

const BARBEIROS = [
  { id: '1', nome: 'Carlos Silva', especialidade: 'Cortes Clássicos', inicial: 'CS' },
  { id: '2', nome: 'Rafael Santos', especialidade: 'Barba & Bigode', inicial: 'RS' },
  { id: '3', nome: 'Diego Lima', especialidade: 'Coloração & Luzes', inicial: 'DL' },
];

const SERVICOS = [
  { nome: 'Corte de Cabelo', preco: 35 },
  { nome: 'Barba', preco: 25 },
  { nome: 'Sobrancelha', preco: 15 },
  { nome: 'Pézinho', preco: 20 },
  { nome: 'Hidratação', preco: 45 },
];

const MESES   = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
const MESES_C = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
const SEMANA  = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];

const HORARIOS = (() => {
  const slots = [];
  for (let h = 8; h <= 17; h++) {
    if (h === 12) continue;
    for (let m = 0; m < 60; m += 15)
      slots.push(`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`);
  }
  return slots;
})();

const formatarData  = d => d ? `${SEMANA[d.getDay()]}, ${d.getDate()} de ${MESES_C[d.getMonth()]}` : '';
const formatarPreco = p => `R$ ${p},00`;

// ─── CALENDÁRIO ──────────────────────────────────────────────────
function Calendario({ dataSel, onSelect }) {
  const hoje = new Date();
  const hA = hoje.getFullYear(), hM = hoje.getMonth(), hD = hoje.getDate();
  const [ref, setRef] = useState(new Date(hA, hM, 1));
  const ano = ref.getFullYear(), mes = ref.getMonth();
  const totalDias = new Date(ano, mes + 1, 0).getDate();
  const inicioDia = new Date(ano, mes, 1).getDay();
  const ehMesAtual = ano === hA && mes === hM;
  const celulas = [...Array(inicioDia).fill(null), ...Array.from({ length: totalDias }, (_, i) => i + 1)];
  const isSel     = d => dataSel && dataSel.getDate() === d && dataSel.getMonth() === mes && dataSel.getFullYear() === ano;
  const isHoje    = d => d === hD && mes === hM && ano === hA;
  const isPassado = d => new Date(ano, mes, d) < new Date(hA, hM, hD);
  return (
    <View style={cal.caixa}>
      <View style={cal.topo}>
        <TouchableOpacity style={[cal.navBtn, ehMesAtual && { opacity: 0.25 }]} onPress={() => !ehMesAtual && setRef(new Date(ano, mes - 1, 1))} disabled={ehMesAtual}>
          <Text style={cal.navSeta}>‹</Text>
        </TouchableOpacity>
        <View style={{ alignItems: 'center' }}>
          <Text style={cal.mesTitulo}>{MESES[mes]} {ano}</Text>
          {!ehMesAtual && <TouchableOpacity onPress={() => setRef(new Date(hA, hM, 1))}><Text style={{ color: ROXO, fontSize: 11, marginTop: 2 }}>↩ hoje</Text></TouchableOpacity>}
        </View>
        <TouchableOpacity style={cal.navBtn} onPress={() => setRef(new Date(ano, mes + 1, 1))}>
          <Text style={cal.navSeta}>›</Text>
        </TouchableOpacity>
      </View>
      <View style={cal.headerSemana}>
        {['D','S','T','Q','Q','S','S'].map((d, i) => (
          <Text key={i} style={[cal.diaSemana, i === 0 && { color: '#ef4444' }]}>{d}</Text>
        ))}
      </View>
      <View style={cal.grade}>
        {celulas.map((dia, i) => {
          const dom = i % 7 === 0;
          const sel = dia && isSel(dia), pass = dia && isPassado(dia), hj = dia && isHoje(dia);
          return (
            <TouchableOpacity key={i} style={[cal.celula, hj && !sel && cal.celulaHoje, sel && cal.celulaSel]}
              onPress={() => dia && !pass && !dom && onSelect(new Date(ano, mes, dia))}
              disabled={!dia || pass || dom} activeOpacity={0.7}>
              <Text style={[cal.diaNum, (pass || dom) && { opacity: dom ? 0.4 : 0.2 }, dom && { color: '#ef4444' }, hj && !sel && { color: ROXO, fontWeight: 'bold' }, sel && { color: '#fff', fontWeight: 'bold' }]}>
                {dia ?? ''}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <View style={cal.legenda}>
        <Text style={cal.legendaItem}><Text style={{ color: '#ef4444' }}>D</Text> = fechado</Text>
        <Text style={cal.legendaItem}>· borda = hoje</Text>
        <Text style={cal.legendaItem}>· roxo = selecionado</Text>
      </View>
    </View>
  );
}

// ─── MODAIS ──────────────────────────────────────────────────────
function ModalConfirmar({ vis, dados, onFechar, onConfirmar }) {
  return (
    <Modal transparent animationType="slide" visible={vis} onRequestClose={onFechar}>
      <View style={md.overlay}>
        <View style={md.sheet}>
          <View style={md.alca} />
          <Text style={md.titulo}>Confirmar agendamento</Text>
          <View style={md.resumo}>
            {[['Nome', dados.nome, null], ['Barbeiro', dados.barbeiro, null], ['Serviço', dados.servico, ROXO], ['Valor', dados.preco, '#22c55e'], ['Data', dados.data, null], ['Horário', dados.horario, null]].map(([k, v, cor]) => (
              <View key={k} style={md.linha}>
                <Text style={md.lKey}>{k}</Text>
                <Text style={[md.lVal, cor && { color: cor }]}>{v}</Text>
              </View>
            ))}
          </View>
          <View style={md.botoes}>
            <TouchableOpacity style={md.btnSec} onPress={onFechar}><Text style={md.btnSecText}>Voltar</Text></TouchableOpacity>
            <TouchableOpacity style={md.btnPrim} onPress={onConfirmar}><Text style={md.btnPrimText}>Confirmar</Text></TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function ModalSucesso({ vis, dados, onFechar }) {
  return (
    <Modal transparent animationType="fade" visible={vis} onRequestClose={onFechar}>
      <View style={md.overlay}>
        <View style={[md.sheet, { alignItems: 'center', paddingVertical: 40 }]}>
          <View style={md.check}><Text style={{ color: '#fff', fontSize: 32, fontWeight: 'bold' }}>✓</Text></View>
          <Text style={[md.titulo, { marginTop: 20, textAlign: 'center' }]}>Agendado com sucesso!</Text>
          <Text style={{ color: '#71717a', fontSize: 13, textAlign: 'center', marginTop: 4 }}>
            {dados?.servico} com {dados?.barbeiro}
          </Text>
          <Text style={{ color: ROXO, fontSize: 14, fontWeight: 'bold', marginTop: 4 }}>{dados?.data} às {dados?.horario}</Text>
          <Text style={{ color: '#22c55e', fontSize: 18, fontWeight: 'bold', marginTop: 8 }}>{dados?.preco}</Text>
          <TouchableOpacity style={[md.btnPrim, { marginTop: 32, width: '100%' }]} onPress={onFechar}>
            <Text style={md.btnPrimText}>Ver meus agendamentos</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

function ModalCancelar({ vis, onFechar, onConfirmar }) {
  return (
    <Modal transparent animationType="fade" visible={vis} onRequestClose={onFechar}>
      <View style={md.overlay}>
        <View style={md.sheet}>
          <View style={md.alca} />
          <Text style={md.titulo}>Cancelar agendamento?</Text>
          <Text style={{ color: '#71717a', fontSize: 13, marginBottom: 28 }}>Essa ação não pode ser desfeita.</Text>
          <View style={md.botoes}>
            <TouchableOpacity style={md.btnSec} onPress={onFechar}><Text style={md.btnSecText}>Não</Text></TouchableOpacity>
            <TouchableOpacity style={[md.btnPrim, { backgroundColor: '#7f1d1d' }]} onPress={onConfirmar}><Text style={md.btnPrimText}>Sim, cancelar</Text></TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ─── APP ─────────────────────────────────────────────────────────
export default function App() {
  const [tela, setTela] = useState('home');
  const [nome, setNome] = useState('');
  const [barbeiroSel, setBarbeiroSel] = useState(null);
  const [servicoSel, setServicoSel] = useState(null);
  const [horarioSel, setHorarioSel] = useState('');
  const [dataSel, setDataSel] = useState(null);
  const [agendamentos, setAgendamentos] = useState([]);
  const [erro, setErro] = useState('');
  const [modalConfirmar, setModalConfirmar] = useState(false);
  const [modalSucesso, setModalSucesso] = useState(false);
  const [modalCancelar, setModalCancelar] = useState(null);
  const [lastDados, setLastDados] = useState(null);
  const [perfilNome, setPerfilNome] = useState('');
  const [perfilTelefone, setPerfilTelefone] = useState('');

  const progresso = [!!nome.trim(), !!barbeiroSel, !!dataSel, !!servicoSel, !!horarioSel].filter(Boolean).length;

  const horarioOcupado = h =>
    dataSel && barbeiroSel &&
    agendamentos.some(a => a.data === formatarData(dataSel) && a.horario === h && a.barbeiroId === barbeiroSel.id);

  const tentarConfirmar = () => {
    if (!nome.trim()) { setErro('Informe seu nome'); return; }
    if (!barbeiroSel) { setErro('Selecione um barbeiro'); return; }
    if (!dataSel)     { setErro('Selecione uma data'); return; }
    if (!servicoSel)  { setErro('Selecione um serviço'); return; }
    if (!horarioSel)  { setErro('Selecione um horário'); return; }
    setErro('');
    setModalConfirmar(true);
  };

  const confirmar = () => {
    const dados = {
      id: Date.now().toString(),
      nome: nome.trim(),
      barbeiro: barbeiroSel.nome,
      barbeiroId: barbeiroSel.id,
      servico: servicoSel.nome,
      preco: formatarPreco(servicoSel.preco),
      data: formatarData(dataSel),
      horario: horarioSel,
    };
    setLastDados(dados);
    setAgendamentos(prev => [...prev, dados]);
    setNome(''); setBarbeiroSel(null); setServicoSel(null); setHorarioSel(''); setDataSel(null);
    setModalConfirmar(false);
    setModalSucesso(true);
  };

  const cancelarAgendamento = () => {
    setAgendamentos(prev => prev.filter(a => a.id !== modalCancelar));
    setModalCancelar(null);
  };

  // ── HOME ─────────────────────────────────────────────────────
  if (tela === 'home') return (
    <SafeAreaView style={s.safe}>
      <View style={s.container}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View>
            <Text style={s.logo}><Text style={s.roxo}>AGEN</Text>DEI</Text>
            <Text style={s.sub}>{perfilNome ? `Olá, ${perfilNome}! 👋` : 'Sua barbearia na palma da mão'}</Text>
          </View>
          <TouchableOpacity style={s.perfilBtn} onPress={() => setTela('perfil')}>
            <Text style={s.perfilInicial}>{perfilNome ? perfilNome[0].toUpperCase() : '👤'}</Text>
          </TouchableOpacity>
        </View>
        <View style={{ marginTop: 48 }}>
          <TouchableOpacity style={s.btnPrimary} onPress={() => { setNome(perfilNome); setTela('agendar'); }}>
            <Text style={s.btnText}>Fazer Agendamento</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.btnSecondary} onPress={() => setTela('lista')}>
            <Text style={s.btnTextSec}>Meus Agendamentos{agendamentos.length > 0 ? ` (${agendamentos.length})` : ''}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );

  // ── PERFIL ───────────────────────────────────────────────────
  if (tela === 'perfil') return (
    <SafeAreaView style={s.safe}>
      <ScrollView style={s.container}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 28 }}>
          <TouchableOpacity onPress={() => setTela('home')} style={{ marginRight: 12 }}>
            <Text style={{ color: ROXO, fontSize: 26 }}>‹</Text>
          </TouchableOpacity>
          <Text style={s.titulo}>Meu Perfil</Text>
        </View>
        <View style={{ alignItems: 'center', marginBottom: 32 }}>
          <View style={s.avatarGrande}>
            <Text style={s.avatarGrandeText}>{perfilNome ? perfilNome[0].toUpperCase() : '?'}</Text>
          </View>
          {!!perfilNome && <Text style={{ color: '#f4f4f5', fontSize: 16, fontWeight: 'bold', marginTop: 12 }}>{perfilNome}</Text>}
        </View>
        <Text style={s.label}>Nome</Text>
        <TextInput style={s.input} placeholder="Seu nome completo" placeholderTextColor="#52525b" value={perfilNome} onChangeText={setPerfilNome} />
        <Text style={s.label}>Telefone</Text>
        <TextInput style={s.input} placeholder="(11) 99999-9999" placeholderTextColor="#52525b" value={perfilTelefone} onChangeText={setPerfilTelefone} keyboardType="phone-pad" />
        <TouchableOpacity style={s.btnPrimary} onPress={() => setTela('home')}>
          <Text style={s.btnText}>Salvar perfil</Text>
        </TouchableOpacity>
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );

  // ── AGENDAR ──────────────────────────────────────────────────
  if (tela === 'agendar') return (
    <SafeAreaView style={s.safe}>
      <ScrollView style={s.container} showsVerticalScrollIndicator={false}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity onPress={() => setTela('home')} style={{ marginRight: 12 }}>
              <Text style={{ color: ROXO, fontSize: 26 }}>‹</Text>
            </TouchableOpacity>
            <Text style={s.titulo}>Novo Agendamento</Text>
          </View>
          <Text style={{ color: '#52525b', fontSize: 12 }}>{progresso} / 5</Text>
        </View>
        <View style={s.barraFundo}><View style={[s.barraFill, { width: `${(progresso / 5) * 100}%` }]} /></View>

        <Text style={s.label}>Seu nome</Text>
        <TextInput style={s.input} placeholder="Ex: João Silva" placeholderTextColor="#52525b" value={nome} onChangeText={t => { setNome(t); setErro(''); }} />

        <Text style={s.label}>Escolha o barbeiro</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 4 }}>
          {BARBEIROS.map(b => {
            const sel = barbeiroSel?.id === b.id;
            return (
              <TouchableOpacity key={b.id} style={[s.barbeiroCard, sel && s.barbeiroCardSel]} onPress={() => { setBarbeiroSel(b); setHorarioSel(''); setErro(''); }}>
                <View style={[s.barbeiroAvatar, sel && { backgroundColor: ROXO }]}>
                  <Text style={[s.barbeiroAvatarText, sel && { color: '#fff' }]}>{b.inicial}</Text>
                </View>
                <Text style={[s.barbeiroNome, sel && { color: ROXO }]}>{b.nome}</Text>
                <Text style={s.barbeiroEsp}>{b.especialidade}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <Text style={s.label}>Escolha a data</Text>
        <Calendario dataSel={dataSel} onSelect={d => { setDataSel(d); setHorarioSel(''); setErro(''); }} />
        {dataSel && <View style={s.dataBox}><Text style={s.dataBoxText}>📅 {formatarData(dataSel)}</Text></View>}

        <Text style={s.label}>Escolha o serviço</Text>
        {SERVICOS.map(sv => {
          const sel = servicoSel?.nome === sv.nome;
          return (
            <TouchableOpacity key={sv.nome} style={[s.opcao, sel && s.opcaoSel]} onPress={() => { setServicoSel(sv); setErro(''); }}>
              <Text style={[s.opcaoText, sel && { color: ROXO, fontWeight: 'bold' }]}>{sv.nome}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={{ color: '#22c55e', fontSize: 13, fontWeight: '600' }}>{formatarPreco(sv.preco)}</Text>
                {sel && <Text style={{ color: ROXO }}>✓</Text>}
              </View>
            </TouchableOpacity>
          );
        })}

        <Text style={s.label}>Escolha o horário</Text>
        {!barbeiroSel || !dataSel ? (
          <Text style={{ color: '#52525b', fontSize: 12, marginBottom: 8 }}>⚠ Selecione barbeiro e data primeiro</Text>
        ) : (
          <View style={s.horarios}>
            {HORARIOS.map(h => {
              const ocupado = horarioOcupado(h);
              const sel = horarioSel === h;
              return (
                <TouchableOpacity key={h} style={[s.horario, sel && s.horarioSel, ocupado && s.horarioOcupado]}
                  onPress={() => { setHorarioSel(h); setErro(''); }} disabled={ocupado}>
                  <Text style={[s.horarioText, sel && { color: ROXO, fontWeight: 'bold' }, ocupado && { color: '#3f3f46' }]}>{h}</Text>
                  {ocupado && <Text style={{ color: '#3f3f46', fontSize: 8, marginTop: 1 }}>ocupado</Text>}
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {!!erro && <Text style={s.erroText}>⚠ {erro}</Text>}
        <TouchableOpacity style={s.btnPrimary} onPress={tentarConfirmar}><Text style={s.btnText}>Confirmar Agendamento</Text></TouchableOpacity>
        <TouchableOpacity style={s.btnSecondary} onPress={() => setTela('home')}><Text style={s.btnTextSec}>Voltar</Text></TouchableOpacity>
        <View style={{ height: 40 }} />
      </ScrollView>

      <ModalConfirmar
        vis={modalConfirmar}
        dados={{ nome, barbeiro: barbeiroSel?.nome, servico: servicoSel?.nome, preco: formatarPreco(servicoSel?.preco ?? 0), data: formatarData(dataSel), horario: horarioSel }}
        onFechar={() => setModalConfirmar(false)}
        onConfirmar={confirmar}
      />
      <ModalSucesso vis={modalSucesso} dados={lastDados} onFechar={() => { setModalSucesso(false); setTela('lista'); }} />
    </SafeAreaView>
  );

  // ── LISTA ─────────────────────────────────────────────────────
  if (tela === 'lista') return (
    <SafeAreaView style={s.safe}>
      <View style={s.container}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
          <TouchableOpacity onPress={() => setTela('home')} style={{ marginRight: 12 }}>
            <Text style={{ color: ROXO, fontSize: 26 }}>‹</Text>
          </TouchableOpacity>
          <Text style={s.titulo}>Agendamentos</Text>
          {agendamentos.length > 0 && <View style={[s.badge, { marginLeft: 8 }]}><Text style={s.badgeText}>{agendamentos.length}</Text></View>}
        </View>

        {agendamentos.length === 0 ? (
          <View style={{ alignItems: 'center', marginTop: 60 }}>
            <Text style={{ fontSize: 48, marginBottom: 16 }}>📅</Text>
            <Text style={s.vazio}>Nenhum agendamento ainda.</Text>
            <TouchableOpacity onPress={() => setTela('agendar')}><Text style={{ color: ROXO, marginTop: 10, fontSize: 14 }}>Agendar agora →</Text></TouchableOpacity>
          </View>
        ) : (
          <FlatList data={agendamentos} keyExtractor={item => item.id} contentContainerStyle={{ paddingBottom: 20 }}
            renderItem={({ item }) => (
              <View style={s.card}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <View style={{ flex: 1 }}>
                    <Text style={s.cardNome}>{item.nome}</Text>
                    <Text style={{ color: '#71717a', fontSize: 12, marginTop: 2 }}>✂️ {item.barbeiro}</Text>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                      <Text style={s.cardServico}>{item.servico}</Text>
                      <Text style={{ color: '#22c55e', fontSize: 13, fontWeight: '600' }}>{item.preco}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', marginTop: 8, gap: 8, flexWrap: 'wrap' }}>
                      <View style={s.chip}><Text style={s.chipText}>📅 {item.data}</Text></View>
                      <View style={s.chip}><Text style={s.chipText}>🕐 {item.horario}</Text></View>
                    </View>
                  </View>
                  <TouchableOpacity style={s.btnX} onPress={() => setModalCancelar(item.id)}>
                    <Text style={{ color: '#71717a', fontSize: 16 }}>✕</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />
        )}
        <TouchableOpacity style={s.btnPrimary} onPress={() => setTela('agendar')}><Text style={s.btnText}>+ Novo Agendamento</Text></TouchableOpacity>
        <TouchableOpacity style={s.btnSecondary} onPress={() => setTela('home')}><Text style={s.btnTextSec}>Início</Text></TouchableOpacity>
      </View>
      <ModalCancelar vis={!!modalCancelar} onFechar={() => setModalCancelar(null)} onConfirmar={cancelarAgendamento} />
    </SafeAreaView>
  );
}

// ─── ESTILOS ─────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#09090b' },
  container: { flex: 1, padding: 20, paddingTop: 60 },
  logo: { fontSize: 38, fontWeight: 'bold', color: '#f4f4f5', letterSpacing: 1 },
  roxo: { color: ROXO },
  sub: { color: '#71717a', marginTop: 8, fontSize: 14 },
  titulo: { fontSize: 22, fontWeight: 'bold', color: '#f4f4f5' },
  label: { color: '#71717a', fontSize: 11, fontWeight: '700', marginBottom: 8, marginTop: 20, textTransform: 'uppercase', letterSpacing: 0.8 },
  input: { backgroundColor: '#18181b', color: '#f4f4f5', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#27272a', fontSize: 15 },
  barraFundo: { height: 3, backgroundColor: '#27272a', borderRadius: 2, marginBottom: 24 },
  barraFill: { height: 3, backgroundColor: ROXO, borderRadius: 2 },
  dataBox: { backgroundColor: '#1e1333', borderRadius: 8, padding: 10, marginTop: 8, borderWidth: 1, borderColor: '#7c3aed66' },
  dataBoxText: { color: ROXO, fontSize: 13, fontWeight: '600' },
  opcao: { backgroundColor: '#18181b', borderRadius: 10, padding: 14, marginBottom: 6, borderWidth: 1, borderColor: '#27272a', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  opcaoSel: { borderColor: ROXO, backgroundColor: '#1e1333' },
  opcaoText: { color: '#a1a1aa', fontSize: 14 },
  horarios: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 4 },
  horario: { backgroundColor: '#18181b', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 10, borderWidth: 1, borderColor: '#27272a', minWidth: 64, alignItems: 'center' },
  horarioSel: { borderColor: ROXO, backgroundColor: '#1e1333' },
  horarioOcupado: { backgroundColor: '#0d0d0d', borderColor: '#1c1c1c' },
  horarioText: { color: '#a1a1aa', fontSize: 12 },
  erroText: { color: '#ef4444', fontSize: 12, marginTop: 14, textAlign: 'center' },
  btnPrimary: { backgroundColor: ROXO, borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 20 },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  btnSecondary: { borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 10, borderWidth: 1, borderColor: '#27272a' },
  btnTextSec: { color: '#a1a1aa', fontSize: 14 },
  card: { backgroundColor: '#18181b', borderRadius: 12, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: '#27272a' },
  cardNome: { color: '#f4f4f5', fontWeight: 'bold', fontSize: 15 },
  cardServico: { color: ROXO, fontSize: 13 },
  chip: { backgroundColor: '#27272a', borderRadius: 6, paddingVertical: 4, paddingHorizontal: 8 },
  chipText: { color: '#a1a1aa', fontSize: 12 },
  btnX: { width: 32, height: 32, borderRadius: 8, borderWidth: 1, borderColor: '#27272a', alignItems: 'center', justifyContent: 'center' },
  badge: { backgroundColor: ROXO, borderRadius: 12, paddingHorizontal: 8, paddingVertical: 3 },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
  vazio: { color: '#71717a', fontSize: 15, textAlign: 'center' },
  perfilBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#27272a', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#3f3f46' },
  perfilInicial: { color: '#f4f4f5', fontSize: 18 },
  avatarGrande: { width: 80, height: 80, borderRadius: 40, backgroundColor: ROXO, alignItems: 'center', justifyContent: 'center' },
  avatarGrandeText: { color: '#fff', fontSize: 32, fontWeight: 'bold' },
  barbeiroCard: { backgroundColor: '#18181b', borderRadius: 12, padding: 14, marginRight: 10, borderWidth: 1, borderColor: '#27272a', alignItems: 'center', width: 120 },
  barbeiroCardSel: { borderColor: ROXO, backgroundColor: '#1e1333' },
  barbeiroAvatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#27272a', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  barbeiroAvatarText: { color: '#a1a1aa', fontSize: 14, fontWeight: 'bold' },
  barbeiroNome: { color: '#f4f4f5', fontSize: 12, fontWeight: 'bold', textAlign: 'center' },
  barbeiroEsp: { color: '#71717a', fontSize: 10, textAlign: 'center', marginTop: 2 },
});

const cal = StyleSheet.create({
  caixa: { backgroundColor: '#18181b', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: '#27272a' },
  topo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  navBtn: { width: 34, height: 34, borderRadius: 8, backgroundColor: '#27272a', alignItems: 'center', justifyContent: 'center' },
  navSeta: { color: '#a1a1aa', fontSize: 24, lineHeight: 28 },
  mesTitulo: { color: '#f4f4f5', fontSize: 15, fontWeight: 'bold' },
  headerSemana: { flexDirection: 'row', marginBottom: 8 },
  diaSemana: { flex: 1, textAlign: 'center', color: '#52525b', fontSize: 12, fontWeight: '700' },
  grade: { flexDirection: 'row', flexWrap: 'wrap' },
  celula: { width: '14.28%', aspectRatio: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 8 },
  celulaHoje: { borderWidth: 1.5, borderColor: ROXO },
  celulaSel: { backgroundColor: ROXO },
  diaNum: { color: '#a1a1aa', fontSize: 13 },
  legenda: { flexDirection: 'row', gap: 10, marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#27272a' },
  legendaItem: { color: '#3f3f46', fontSize: 10 },
});

const md = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#18181b', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 },
  alca: { width: 40, height: 4, backgroundColor: '#3f3f46', borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
  titulo: { color: '#f4f4f5', fontSize: 17, fontWeight: 'bold', marginBottom: 20 },
  resumo: { backgroundColor: '#09090b', borderRadius: 12, padding: 16, marginBottom: 24, gap: 12 },
  linha: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  lKey: { color: '#71717a', fontSize: 13 },
  lVal: { color: '#f4f4f5', fontSize: 13, fontWeight: '600', flexShrink: 1, textAlign: 'right' },
  botoes: { flexDirection: 'row', gap: 12 },
  btnSec: { flex: 1, borderRadius: 12, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: '#27272a' },
  btnSecText: { color: '#a1a1aa', fontWeight: '600' },
  btnPrim: { flex: 1, backgroundColor: ROXO, borderRadius: 12, padding: 14, alignItems: 'center' },
  btnPrimText: { color: '#fff', fontWeight: 'bold' },
  check: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#16a34a', alignItems: 'center', justifyContent: 'center' },
});
