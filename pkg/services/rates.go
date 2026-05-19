package services

import (
	"github.com/lubasinkal/v-star/pkg/rates"
	"v-desktop/pkg/models"
)

type RatesService struct{}

func NewRatesService() *RatesService {
	return &RatesService{}
}

func (s *RatesService) PresentValue(rate, sumAssured float64, term int) float64 {
	conv := rates.NewRateConverter(rate)
	return conv.PresentValue(sumAssured, term)
}

func (s *RatesService) PresentValueStar(rate, j, sumAssured float64, term int) float64 {
	conv := rates.NewRateConverter(rate)
	return conv.PresentValueStar(sumAssured, term, j)
}

func (s *RatesService) V(rate float64) float64 {
	conv := rates.NewRateConverter(rate)
	return conv.V()
}

func (s *RatesService) VStar(rate, j float64) float64 {
	conv := rates.NewRateConverter(rate)
	return conv.VStar(j)
}

func (s *RatesService) ProcessPV(req models.PVRequest) models.PVResponse {
	conv := rates.NewRateConverter(req.InterestRate)
	results := make([]models.PVResult, len(req.Records))
	for i, r := range req.Records {
		var pv float64
		if req.RateJ != 0 {
			pv = conv.PresentValueStar(r.SumAssured, r.Term, req.RateJ)
		} else {
			pv = conv.PresentValue(r.SumAssured, r.Term)
		}
		results[i] = models.PVResult{
			Index:       i,
			SumAssured:  r.SumAssured,
			Term:        r.Term,
			PresentValue: pv,
		}
	}
	return models.PVResponse{Results: results}
}

func (s *RatesService) NominalToEffective(im float64, m int) float64 {
	return rates.NominalToEffective(im, m)
}

func (s *RatesService) EffectiveToNominal(i float64, m int) float64 {
	return rates.EffectiveToNominal(i, m)
}

func (s *RatesService) ForceOfInterest(i float64) float64 {
	return rates.ForceOfInterest(i)
}

func (s *RatesService) InterestFromForce(delta float64) float64 {
	return rates.InterestFromForce(delta)
}

func (s *RatesService) AnnuityCertainImmediate(i float64, n int) float64 {
	return rates.AnnuityCertainImmediate(i, n)
}

func (s *RatesService) AnnuityCertainDue(i float64, n int) float64 {
	return rates.AnnuityCertainDue(i, n)
}

func (s *RatesService) MacaulayDuration(i float64, cashFlows []float64) float64 {
	return rates.MacaulayDuration(i, cashFlows)
}

func (s *RatesService) ModifiedDuration(i float64, cashFlows []float64) float64 {
	return rates.ModifiedDuration(i, cashFlows)
}

func (s *RatesService) Convexity(i float64, cashFlows []float64) float64 {
	return rates.Convexity(i, cashFlows)
}

func (s *RatesService) ConvertRate(req models.RateConvertRequest) models.RateConvertResponse {
	resp := models.RateConvertResponse{}
	switch req.FromType {
	case "effective":
		resp.EffectiveRate = req.FromValue
		resp.NominalRate = rates.EffectiveToNominal(req.FromValue, req.Compounding)
	case "nominal":
		resp.NominalRate = req.FromValue
		resp.EffectiveRate = rates.NominalToEffective(req.FromValue, req.Compounding)
	}
	resp.ForceOfInterest = rates.ForceOfInterest(resp.EffectiveRate)
	return resp
}
