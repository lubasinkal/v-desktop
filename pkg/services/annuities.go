package services

import (
	"fmt"

	"github.com/lubasinkal/v-star/pkg/annuities"
	"github.com/lubasinkal/v-star/pkg/rates"
	"v-desktop/pkg/models"
)

type AnnuityService struct {
	mortSvc *MortalityService
}

func NewAnnuityService(mortSvc *MortalityService) *AnnuityService {
	return &AnnuityService{mortSvc: mortSvc}
}

func (s *AnnuityService) CalcAnnuity(req models.AnnuityRequest) (models.AnnuityResponse, error) {
	table, err := s.mortSvc.GetTable(req.TableName)
	if err != nil {
		return models.AnnuityResponse{}, err
	}

	conv := rates.NewRateConverter(req.Rate)
	calc := annuities.NewAnnuityCalculator(conv, table)

	var pv float64
	switch req.Type {
	case "whole-life-immediate":
		pv = calc.WholeLifeImmediate(req.Age, req.Amount)
	case "whole-life-due":
		pv = calc.WholeLifeDue(req.Age, req.Amount)
	case "term-immediate":
		pv = calc.TermImmediate(req.Age, req.Term, req.Amount)
	case "term-due":
		pv = calc.TermDue(req.Age, req.Term, req.Amount)
	case "deferred-whole-life":
		pv = calc.DeferredWholeLife(req.Age, req.Deferment, req.Amount)
	case "deferred-term":
		pv = calc.DeferredTerm(req.Age, req.Deferment, req.Term, req.Amount)
	case "whole-life-nsp":
		pv = calc.WholeLifeNSP(req.Age, req.Amount)
	case "term-nsp":
		pv = calc.TermNSP(req.Age, req.Term, req.Amount)
	case "endowment-nsp":
		pv = calc.EndowmentNSP(req.Age, req.Term, req.Amount)
	case "approx-whole-life":
		pv = annuities.ApproxWholeLifeImmediate(req.Age, req.Term, req.Amount, req.Rate, table)
	default:
		return models.AnnuityResponse{}, fmt.Errorf("unknown annuity type: %s", req.Type)
	}

	return models.AnnuityResponse{PresentValue: pv}, nil
}
