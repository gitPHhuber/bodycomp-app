import { useMeta } from "../utils/useMeta";

const qaList = [
  {
    q: "DXA — это рентген? Насколько это безопасно?",
    a: "Да, DXA использует низкодозное рентгеновское излучение. Эффективная доза обычно сопоставима с естественным фоновым облучением за короткий период. Решение о сканировании принимается врачом с учётом показаний и противопоказаний.",
  },
  {
    q: "Почему % жира по DXA и биоимпедансу может отличаться?",
    a: "Методы измеряют состав тела по разным физическим принципам. DXA оценивает ткани по рентгеновскому ослаблению, биоимпеданс — по электрическому сопротивлению, чувствительному к гидратации, питанию и времени суток. Поэтому значения не всегда взаимозаменяемы.",
  },
  {
    q: "Можно ли сравнивать результаты между разными аппаратами?",
    a: "Сравнение возможно, но с осторожностью. На результат влияют тип системы, алгоритмы обработки и протокол исследования. Для динамики предпочтительно проходить повторные исследования в одной клинике и на одном типе оборудования.",
  },
  {
    q: "Что DXA показывает лучше всего?",
    a: "DXA хорошо подходит для оценки минеральной плотности кости и состава тела по сегментам: жировой и безжировой массы, включая оценку региональных распределений.",
  },
  {
    q: "Какие ограничения у DXA?",
    a: "Результат зависит от качества позиционирования, калибровки аппарата и корректности протокола. У метода есть противопоказания и организационные ограничения, поэтому DXA не заменяет очную консультацию и клинический контекст.",
  },
];

const sources = [
  { label: "ISCD Official Positions", href: "https://iscd.org/learn/official-positions/" },
  { label: "WHO: obesity and body composition context", href: "https://www.who.int/" },
  { label: "NIH Osteoporosis and Related Bone Diseases", href: "https://www.bones.nih.gov/" },
  { label: "Henzell et al. (pencil vs fan beam discussion)", href: "https://pubmed.ncbi.nlm.nih.gov/" },
];

const card = {
  background: "linear-gradient(135deg, #0f172a, #1e293b)",
  borderRadius: 16,
  border: "1px solid #334155",
  padding: 18,
};

export default function ExpertQAPage() {
  useMeta(
    "Экспертные Q/A по DXA и составу тела | ASVOMED",
    "Ответы экспертов: DXA, процент жира, точность методов, ограничения и источники."
  );

  return (
    <div style={{ minHeight: "100dvh", background: "#020617", color: "#e2e8f0", fontFamily: "'Outfit', sans-serif" }}>
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "104px 20px 60px" }}>
        <h1 style={{ fontSize: 30, margin: "0 0 8px" }}>Экспертные Q/A</h1>
        <p style={{ color: "#94a3b8", fontSize: 14, lineHeight: 1.6, margin: "0 0 18px" }}>
          Тема: DXA, процент жира, точность методов оценки состава тела и их ограничения.
        </p>

        <div style={{ ...card, marginBottom: 14 }}>
          <h2 style={{ fontSize: 18, marginTop: 0 }}>Что это</h2>
          <p style={{ margin: "0 0 8px", color: "#cbd5e1", lineHeight: 1.7 }}>
            Это публичная справочная страница с экспертными ответами на частые вопросы по DXA и интерпретации результатов состава тела.
          </p>
          <p style={{ margin: 0, color: "#cbd5e1", lineHeight: 1.7 }}>
            Материал носит образовательный характер и помогает понять, как корректно использовать результаты в диалоге с врачом.
          </p>
        </div>

        <div style={{ ...card, marginBottom: 14 }}>
          <h2 style={{ fontSize: 18, marginTop: 0 }}>Кому подходит / не подходит</h2>
          <p style={{ margin: "0 0 8px", color: "#cbd5e1", lineHeight: 1.7 }}>
            Подходит пациентам, которые хотят понять разницу между методами оценки состава тела и повысить качество мониторинга динамики.
          </p>
          <p style={{ margin: 0, color: "#cbd5e1", lineHeight: 1.7 }}>
            Не заменяет очную консультацию, постановку диагноза и индивидуальные назначения врача.
          </p>
        </div>

        <div style={{ ...card, marginBottom: 18 }}>
          <h2 style={{ fontSize: 18, marginTop: 0 }}>Точность и ограничения</h2>
          <p style={{ margin: "0 0 8px", color: "#cbd5e1", lineHeight: 1.7 }}>
            DXA считается одним из референсных методов в клинической практике, но итог зависит от протокола, калибровки и сопоставимости оборудования.
          </p>
          <p style={{ margin: 0, color: "#cbd5e1", lineHeight: 1.7 }}>
            Для отслеживания изменений во времени желательно сохранять одинаковые условия измерения и клинику наблюдения.
          </p>
        </div>

        {qaList.map((item) => (
          <div key={item.q} style={{ ...card, marginBottom: 10 }}>
            <h3 style={{ margin: "0 0 6px", fontSize: 16 }}>{item.q}</h3>
            <p style={{ margin: 0, color: "#cbd5e1", lineHeight: 1.7, fontSize: 14 }}>{item.a}</p>
          </div>
        ))}

        <div style={{ ...card, marginTop: 18 }}>
          <h2 style={{ fontSize: 18, marginTop: 0 }}>Источники</h2>
          <ul style={{ margin: 0, paddingLeft: 18, color: "#cbd5e1", lineHeight: 1.7 }}>
            {sources.map((source) => (
              <li key={source.href}>
                <a href={source.href} target="_blank" rel="noopener noreferrer" style={{ color: "#22d3ee" }}>
                  {source.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
